const { Server } = require("socket.io");
const { verifyToken } = require("../Utils/jwt");

let io = null;

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
