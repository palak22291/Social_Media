// pagination security

const crypto = require("crypto");

const CURSOR_SECRET = process.env.CURSOR_SECRET;

function sign(data) {
  return crypto.createHmac("sha256", CURSOR_SECRET).update(data).digest("hex");
}

exports.encodeCursor = (post) => {
  const payload = JSON.stringify({
    createdAt: post.createdAt,
    id: post.id,
  });

  const base64Payload = Buffer.from(payload).toString("base64");
  const signature = sign(base64Payload);
  return `${base64Payload}.${signature}`;
};

// why we need decoding because rn we are only getting the cursor in a form of a string so to decode into real values as we cant query db with a string

// step 1 => split signature and data
// why . becuase when encoding we did base64Payload.signature
// step 2 => verify signature to detect tampering
// step 3 => decode payload to get real values

// if any step fails the request will get rejected

exports.decodeCursor = (cursor) => {
  const [base64Payload, signature] = cursor.split(".");
  const expectedSignature = sign(base64Payload);

  if (signature != expectedSignature) {
    throw new Error("Invalid cursor signature");
  }

  const payload = Buffer.from(base64Payload, "base64").toString("utf-8");
  return JSON.parse(payload);
};




