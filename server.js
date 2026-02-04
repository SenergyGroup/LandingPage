import dotenv from "dotenv";
import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data.sqlite");
const WIDGETS_PATH = path.join(__dirname, "config", "widgets.json");
const ASSETS_DIR = path.join(__dirname, "public");

const KIT_API_KEY = process.env.KIT_API_KEY;
const KIT_FORM_ID = process.env.KIT_FORM_ID;
const KIT_TAG_ID = process.env.KIT_TAG_ID;
const KIT_CUSTOM_TOKEN_FIELD = process.env.KIT_CUSTOM_TOKEN_FIELD || "widget_claim_token";
const KIT_CUSTOM_WIDGET_FIELD = process.env.KIT_CUSTOM_WIDGET_FIELD || "widget_id";
const DOWNLOAD_BASE_URL = process.env.DOWNLOAD_BASE_URL || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@senergygroup.com";
const GUIDE_URL = process.env.GUIDE_URL || "https://example.com/guide.pdf";
const BRAND_NAME = process.env.BRAND_NAME || "SenergyGroup LLC";

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS widget_claims (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    widget_id TEXT NOT NULL,
    status TEXT NOT NULL,
    kit_subscriber_id TEXT,
    claim_token TEXT NOT NULL,
    ip_hash TEXT,
    created_at TEXT NOT NULL,
    confirmed_at TEXT,
    delivered_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_widget_claims_email ON widget_claims(email);
  CREATE INDEX IF NOT EXISTS idx_widget_claims_token ON widget_claims(claim_token);
`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(ASSETS_DIR));

const loadWidgets = () => {
  const raw = fs.readFileSync(WIDGETS_PATH, "utf8");
  return JSON.parse(raw);
};

const hashIp = (ip) => {
  const salt = process.env.IP_SALT || "senergygroup";
  return crypto.createHash("sha256").update(`${ip}-${salt}`).digest("hex");
};

const formatHtml = (title, body) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/public/styles.css" />
  </head>
  <body>
    ${body}
  </body>
</html>`;

const renderHeader = () => `
  <header class="site-header">
    <div class="brand">${BRAND_NAME}</div>
  </header>
`;

const renderFooter = () => `
  <footer class="site-footer">
    <div class="footer-divider"></div>
    <div>
      Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </div>
    <div class="privacy">We respect your inbox. No spam, ever.</div>
  </footer>
`;

const renderClaimPage = (widgets, errorMessage = "") => {
  const widgetCards = widgets
    .map(
      (widget) => `
      <label class="widget-card">
        <input type="radio" name="widget_id" value="${widget.id}" required />
        <div class="widget-thumbnail" style="background-image: url('${widget.thumbnail}')"></div>
        <div class="widget-name">${widget.name}</div>
        <div class="widget-desc">${widget.description}</div>
      </label>
    `
    )
    .join("\n");

  return formatHtml(
    "Claim your free widget",
    `
    ${renderHeader()}
    <main class="container">
      <section class="hero">
        <p class="eyebrow">Free Streamlabs Bonus</p>
        <h1>Claim your free Streamlabs chat widget</h1>
        <p class="subhead">Choose one theme. Confirm your email. Get instant download access.</p>
        ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
      </section>
      <form class="claim-form" action="/claim" method="POST">
        <div class="widget-grid">${widgetCards}</div>
        <div class="form-row">
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <button type="submit" class="primary-button">Send me my widget</button>
        <p class="microcopy">By claiming your widget, you agree to join the SenergyGroup newsletter. 
          We’ll send you monthly widget drops and community votes. 
          No spam. Unsubscribe with one click at any time.</p>
      </form>
    </main>
    ${renderFooter()}
  `
  );
};

const renderCheckEmailPage = (email) =>
  formatHtml(
    "Check your email",
    `
    ${renderHeader()}
    <main class="container narrow">
      <section class="message-card">
        <h1>Check your inbox to confirm your email</h1>
        <p>We sent a confirmation email to <strong>${email}</strong>.</p>
        <p>Once confirmed, you’ll unlock your download instantly.</p>
        <a class="secondary-button" href="/claim">Go back</a>
      </section>
    </main>
    ${renderFooter()}
  `
  );

const renderConfirmedPage = (claim, widget) =>
  formatHtml(
    "Your Widget is Ready!",
    `
    ${renderHeader()}
    <main class="container narrow">
      <section class="message-card">
        <div class="success-icon">✓</div>
        <h1>Success! Your widget is ready</h1>
        <p class="subhead">The <strong>${widget.name}</strong> theme has been unlocked.</p>
        
        <div class="widget-preview">
          <div class="widget-thumbnail large" style="background-image: url('${widget.thumbnail}')"></div>
          <div class="widget-info">
            <div class="widget-name">${widget.name}</div>
            <div class="widget-desc">${widget.description}</div>
          </div>
        </div>

        <div class="button-group">
          <a class="primary-button" href="/download/${claim.claim_token}">Download ZIP File</a>
          <!-- ADDED YOUR ETSY LINK HERE -->
          <a class="secondary-button" href="https://www.etsy.com/shop/SenergyGroup" target="_blank">Browse Our Other Themes on Etsy</a>
        </div>

        <div class="install-notes-callout">
          <h4>Installation Note</h4>
          <p>Perform the setup in a <strong>desktop browser</strong>. The Streamlabs desktop app doesn't support the custom field configuration steps.</p>
        </div>

        <footer class="card-footer">
          <p>Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Response time: Within 24 hours</p>
        </footer>
      </section>
    </main>
    ${renderFooter()}
  `
  );

const renderErrorPage = (message) =>
  formatHtml(
    "Something went wrong",
    `
    ${renderHeader()}
    <main class="container narrow">
      <section class="message-card">
        <h1>Something went wrong</h1>
        <p>${message}</p>
        <a class="secondary-button" href="/claim">Return to claim page</a>
      </section>
    </main>
    ${renderFooter()}
  `
  );

const rateLimitReached = (ipHash) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM widget_claims WHERE ip_hash = ? AND created_at >= ?"
    )
    .get(ipHash, oneHourAgo);
  return row.count >= 5;
};

const createOrUpdateSubscriber = async ({ email, token, widgetId }) => {
  if (!KIT_API_KEY || !KIT_FORM_ID) {
    console.error("Missing Kit Credentials in .env");
    return { subscriber: null };
  }

  const payload = {
    api_key: KIT_API_KEY,
    email,
    tags: KIT_TAG_ID ? [KIT_TAG_ID] : [],
    fields: {
      [KIT_CUSTOM_TOKEN_FIELD]: token,
      [KIT_CUSTOM_WIDGET_FIELD]: widgetId
    }
  };

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // THIS WILL LOG THE EXACT ERROR FROM KIT IN YOUR TERMINAL
      console.error("--- Kit API Error ---");
      console.error(JSON.stringify(data, null, 2));
      throw new Error(`Kit error: ${response.status}`);
    }

    console.log("--- Kit Success ---");
    console.log(`Subscriber ${email} processed successfully.`);
    return { subscriber: data.subscription };
  } catch (error) {
    console.error("Network or Kit Error:", error.message);
    throw error;
  }
};

app.get(["/", "/claim"], (req, res) => {
  const widgets = loadWidgets();
  res.send(renderClaimPage(widgets));
});

app.post("/claim", async (req, res) => {
  const { email, widget_id: widgetId } = req.body;
  const widgets = loadWidgets();
  const widget = widgets.find((item) => item.id === widgetId);

  if (!email || !widget) {
    res.status(400).send(renderClaimPage(widgets, "Please choose a widget and enter an email."));
    return;
  }

  const ipHash = hashIp(req.ip || "unknown");
  if (rateLimitReached(ipHash)) {
    res.status(429).send(renderErrorPage("Rate limit reached. Please try again later."));
    return;
  }

  const claimToken = nanoid(24);
  const claimId = crypto.randomUUID();
  const now = new Date().toISOString();

  let subscriberId = null;

  try {
    const kitResult = await createOrUpdateSubscriber({ email, token: claimToken, widgetId });
    subscriberId = kitResult.subscriber?.subscriber?.id || null;
  } catch (error) {
    res.status(502).send(renderErrorPage("We could not send your confirmation email. Please try again."));
    return;
  }

  db.prepare(
    `INSERT INTO widget_claims
      (id, email, widget_id, status, kit_subscriber_id, claim_token, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(claimId, email, widgetId, "submitted", subscriberId, claimToken, ipHash, now);

  res.redirect(`/check-email?email=${encodeURIComponent(email)}`);
});

app.get("/check-email", (req, res) => {
  const email = req.query.email;
  if (!email) {
    res.redirect("/claim");
    return;
  }
  res.send(renderCheckEmailPage(email));
});

app.get("/confirmed", (req, res) => {
  const token = req.query.token;
  const email = req.query.email;
  const subId = req.query.ck_subscriber_id || req.query.subscriber_id; 
  
  let claim = null;

  // 1. Try to find by Kit Subscriber ID (The most reliable way)
  if (subId) {
    claim = db
      .prepare("SELECT * FROM widget_claims WHERE kit_subscriber_id = ? ORDER BY created_at DESC LIMIT 1")
      .get(subId.toString());
  }

  // 2. Fallback: Try to find by Token
  if (!claim && token) {
    claim = db.prepare("SELECT * FROM widget_claims WHERE claim_token = ?").get(token);
  }

  // 3. Fallback: Try to find by Email
  if (!claim && email) {
    claim = db
      .prepare("SELECT * FROM widget_claims WHERE email = ? ORDER BY created_at DESC LIMIT 1")
      .get(email);
  }

  if (!claim) {
    // If you see this error, it means the ID wasn't saved in the DB during the /claim step
    res.status(404).send(renderErrorPage("We could not find your claim. Please try a fresh request from the home page."));
    return;
  }

  // Rest of the status update logic...
  if (claim.status !== "confirmed" && claim.status !== "delivered") {
    const confirmedAt = new Date().toISOString();
    db.prepare("UPDATE widget_claims SET status = ?, confirmed_at = ? WHERE id = ?").run(
      "confirmed",
      confirmedAt,
      claim.id
    );
    claim.status = "confirmed";
    claim.confirmed_at = confirmedAt;
  }

  const widgets = loadWidgets();
  const widget = widgets.find((item) => item.id === claim.widget_id);

  if (!widget) {
    res.status(404).send(renderErrorPage("We could not locate the widget details."));
    return;
  }

  res.send(renderConfirmedPage(claim, widget));
});

app.get("/download/:token", (req, res) => {
  const token = req.params.token;
  const claim = db.prepare("SELECT * FROM widget_claims WHERE claim_token = ?").get(token);

  if (!claim || claim.status !== "confirmed") {
    res.status(403).send(renderErrorPage("Please confirm your email before downloading."));
    return;
  }

  const widgets = loadWidgets();
  const widget = widgets.find((item) => item.id === claim.widget_id);

  if (!widget) {
    res.status(404).send(renderErrorPage("Widget download is unavailable."));
    return;
  }

  if (DOWNLOAD_BASE_URL) {
    res.redirect(`${DOWNLOAD_BASE_URL}/${widget.zip}`);
    return;
  }

  const zipPath = path.join(__dirname, "assets", "zips", widget.zip);
  res.download(zipPath, widget.zip, (err) => {
    if (err) {
      res.status(500).send(renderErrorPage("Download failed. Please contact support."));
      return;
    }
    const deliveredAt = new Date().toISOString();
    db.prepare("UPDATE widget_claims SET status = ?, delivered_at = ? WHERE id = ?").run(
      "delivered",
      deliveredAt,
      claim.id
    );
  });
});

app.use((req, res) => {
  res.status(404).send(renderErrorPage("Page not found."));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});


