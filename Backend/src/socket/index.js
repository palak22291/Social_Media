const { Server } = require("socket.io");
const { verifyToken } = require("../Utils/jwt");
const { prisma } = require("../../prisma/client");

let io = null;

// Chat rooms are an authorization boundary, not just a fan-out optimisation:
// a client can emit any conversationId, so membership must be checked against
// the DB before joining. Without this, anyone could listen to any conversation.
//
// Errors are NOT swallowed here. A DB blip and "you're not a member" are very
// different outcomes: the first is transient and must be retryable, the second
// is a permanent denial. Collapsing both into `false` silently locks legitimate
// users out of their own chats (observed: one Aiven hiccup denied a real
// participant, who then received no live messages until remount).
async function isConversationParticipant(conversationId, userId) {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });
  return Boolean(row);
}

// one quick retry absorbs the transient connection errors that free-tier
// Postgres throws under concurrent bursts
async function checkParticipantWithRetry(conversationId, userId) {
  try {
    return await isConversationParticipant(conversationId, userId);
  } catch (err) {
    console.warn("participant check errored, retrying once:", err.message?.split("\n")[0]);
    await new Promise((r) => setTimeout(r, 150));
    return isConversationParticipant(conversationId, userId); // may throw → caller handles
  }
}

function initSocket(httpServer, corsOrigins) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
  });

  // Auth middleware — runs once per connection (handshake only).
  // Same verifyToken util as the REST auth middleware: one source of truth.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const decoded = token && verifyToken(token);
    if (!decoded) return next(new Error("unauthorized"));
    socket.user = decoded; // { userId, email }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`socket connected: user ${socket.user.userId} (${socket.id})`);

    // every client follows the global feed
    socket.join("feed");

    // personal room: lets the server push conversation-list updates (new
    // message, unread badge) to a user even when they aren't inside that chat
    socket.join(`user:${socket.user.userId}`);

    // Per-socket rate limit for high-frequency client events (typing).
    // A legit client (throttled to 1 start/2s + stops) stays well under 20
    // per 10s; a spamming client gets silently dropped.
    let eventCount = 0;
    let windowStart = Date.now();
    const withinRateLimit = () => {
      const now = Date.now();
      if (now - windowStart > 10_000) {
        windowStart = now;
        eventCount = 0;
      }
      return ++eventCount <= 20;
    };

    // clients join/leave a post room while viewing PostDetails
    socket.on("post:join", (postId) => {
      const id = parseInt(postId);
      if (!Number.isInteger(id) || id <= 0) return; // validate untrusted input
      socket.join(`post:${id}`);
    });

    socket.on("post:leave", (postId) => {
      const id = parseInt(postId);
      if (Number.isInteger(id)) socket.leave(`post:${id}`);
    });

    // Phase 5 — typing indicators (relay to room, excluding sender).
    // firstName is client-supplied (JWT has no name) — cosmetic only, so
    // sanitize it; userId always comes from the verified socket.
    socket.on("typing:start", (payload) => {
      if (!withinRateLimit()) return;
      const id = parseInt(payload?.postId ?? payload);
      if (!Number.isInteger(id) || id <= 0) return;
      const firstName =
        String(payload?.firstName || "").trim().slice(0, 40) || "Someone";
      socket.to(`post:${id}`).emit("typing:start", {
        userId: socket.user.userId,
        firstName,
      });
    });
    socket.on("typing:stop", (payload) => {
      if (!withinRateLimit()) return;
      const id = parseInt(payload?.postId ?? payload);
      if (!Number.isInteger(id) || id <= 0) return;
      socket.to(`post:${id}`).emit("typing:stop", { userId: socket.user.userId });
    });

    // ─── Chat ───────────────────────────────────────────────────────────
    // Unlike post rooms (posts are public), conversation rooms are private:
    // membership is verified against the DB before the socket joins.
    // The optional `ack` callback tells the client whether the join actually
    // succeeded, so a transient failure can be retried instead of leaving the
    // user in a chat that silently receives nothing.
    socket.on("conversation:join", async (conversationId, ack) => {
      const id = parseInt(conversationId);
      if (!Number.isInteger(id) || id <= 0) {
        return ack?.({ ok: false, reason: "invalid" });
      }
      try {
        if (!(await checkParticipantWithRetry(id, socket.user.userId))) {
          console.warn(
            `socket: user ${socket.user.userId} denied join of conversation:${id}`
          );
          // deliberately vague: never reveals whether the conversation exists
          return ack?.({ ok: false, reason: "forbidden" });
        }
        socket.join(`conversation:${id}`);
        ack?.({ ok: true });
      } catch (err) {
        // infrastructure failure, NOT an authorization decision — stay out of
        // the room (fail closed) but tell the client it may retry
        console.error(
          `socket: conversation:${id} join check failed for user ${socket.user.userId}:`,
          err.message?.split("\n")[0]
        );
        ack?.({ ok: false, reason: "error", retryable: true });
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      const id = parseInt(conversationId);
      if (Number.isInteger(id) && id > 0) socket.leave(`conversation:${id}`);
    });

    // Chat typing relays. Room membership was already authorised at join time,
    // and socket.to() excludes the sender.
    socket.on("chat:typing:start", (payload) => {
      if (!withinRateLimit()) return;
      const id = parseInt(payload?.conversationId ?? payload);
      if (!Number.isInteger(id) || id <= 0) return;
      const firstName =
        String(payload?.firstName || "").trim().slice(0, 40) || "Someone";
      socket.to(`conversation:${id}`).emit("chat:typing:start", {
        conversationId: id,
        userId: socket.user.userId,
        firstName,
      });
    });

    socket.on("chat:typing:stop", (payload) => {
      if (!withinRateLimit()) return;
      const id = parseInt(payload?.conversationId ?? payload);
      if (!Number.isInteger(id) || id <= 0) return;
      socket.to(`conversation:${id}`).emit("chat:typing:stop", {
        conversationId: id,
        userId: socket.user.userId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`socket disconnected: user ${socket.user.userId} (${socket.id})`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// Never let a broadcast failure break a REST response (used by Phase 2 emits)
function safeEmit(room, event, payload) {
  try {
    getIO().to(room).emit(event, payload);
  } catch (err) {
    console.error("emit failed:", event, err.message);
  }
}

module.exports = { initSocket, getIO, safeEmit };
