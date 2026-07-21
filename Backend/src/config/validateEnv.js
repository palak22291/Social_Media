// Startup environment check.
//
// Two production outages were caused by an env var that existed locally but
// was never added on Render (CURSOR_SECRET broke the whole feed; a mismatched
// GOOGLE_CLIENT_ID breaks Google sign-in). Both failed *silently* — a generic
// 500 per request, with the real cause buried in logs.
//
// This prints one unmissable report at boot so a misconfigured deploy is
// obvious immediately.

// Missing these means the app cannot function at all → refuse to start.
const FATAL = [
  { name: "DATABASE_URL", why: "database connection" },
  { name: "JWT_SECRET", why: "signing/verifying auth tokens" },
];

// Missing these breaks one feature but the rest of the API still works →
// loud warning rather than taking the whole service down.
const FEATURE = [
  { name: "CURSOR_SECRET", why: "feed cursor pagination (GET /posts/feed will 500)" },
  { name: "GOOGLE_CLIENT_ID", why: "Google sign-in (POST /auth/google will fail)" },
];

function validateEnv() {
  const missingFatal = FATAL.filter((v) => !process.env[v.name]);
  const missingFeature = FEATURE.filter((v) => !process.env[v.name]);

  const present = [...FATAL, ...FEATURE]
    .filter((v) => process.env[v.name])
    .map((v) => v.name);

  console.log("─".repeat(60));
  console.log("Environment check");
  console.log("  present:", present.length ? present.join(", ") : "(none)");

  if (missingFeature.length) {
    for (const v of missingFeature) {
      console.error(`  ⚠️  MISSING ${v.name} — breaks: ${v.why}`);
    }
  }

  if (missingFatal.length) {
    for (const v of missingFatal) {
      console.error(`  ❌ MISSING ${v.name} — required for: ${v.why}`);
    }
    console.log("─".repeat(60));
    throw new Error(
      `Refusing to start: missing required env var(s): ${missingFatal
        .map((v) => v.name)
        .join(", ")}`
    );
  }

  if (!missingFeature.length) console.log("  all required variables set ✅");
  console.log("─".repeat(60));
}

module.exports = { validateEnv };
