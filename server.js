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
const ZIPS_ROOT = path.join(__dirname, "assets", "zips");
const IMAGES_ROOT = path.join(__dirname, "public", "images");
const PLACEHOLDER_THUMB = "/public/images/_placeholder.svg";

const KIT_API_KEY = process.env.KIT_API_KEY;
const KIT_FORM_ID = process.env.KIT_FORM_ID;
const KIT_TAG_ID = process.env.KIT_TAG_ID;
const KIT_CUSTOM_TOKEN_FIELD = process.env.KIT_CUSTOM_TOKEN_FIELD || "widget_claim_token";
const KIT_CUSTOM_WIDGET_FIELD = process.env.KIT_CUSTOM_WIDGET_FIELD || "widget_id";
const DOWNLOAD_BASE_URL = process.env.DOWNLOAD_BASE_URL || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "info@senergygroup.org";
const GUIDE_URL = process.env.GUIDE_URL || "https://example.com/guide.pdf";
const BRAND_NAME = process.env.BRAND_NAME || "SenergyGroup LLC";
const ETSY_SHOP_URL = process.env.ETSY_SHOP_URL || "https://www.etsy.com/shop/SenergyGroup";
// Gate for /admin/requests. Unset = admin view disabled entirely.
const ADMIN_KEY = process.env.ADMIN_KEY || "";

// Custom commission intro pricing. Single source of truth for the /custom
// pricing table AND the request-form checkboxes, so they can never drift.
const CUSTOM_PIECES = [
  { key: "full-kit", label: "Full Custom Stream Kit", includes: "All 8 pieces below, one matching theme: chat, alerts, 3 scenes, goal bar, game frame, panels", price: 199, highlight: true },
  { key: "chat", label: "Custom Chat Widget", includes: "Live chat overlay with your colors, fonts, and layout, fully coded, not a static image", price: 59 },
  { key: "alerts", label: "Custom Alert Set", includes: "Follow / sub / tip / cheer / raid pop-ups in your style, one install", price: 59 },
  { key: "scenes", label: "Custom Scene Set", includes: "Starting Soon + BRB + Stream Ending screens, animated and loop-safe", price: 89 },
  { key: "goal", label: "Custom Goal Bar", includes: "Follower / sub / tip goal bar themed to match", price: 35 },
  { key: "panels", label: "Custom Twitch Panels (set of 5)", includes: "About / Schedule / Donate / Rules / Socials banners", price: 35 },
  { key: "frame", label: "Custom Game Frame", includes: "Webcam + gameplay border overlay", price: 39 },
];

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
  CREATE TABLE IF NOT EXISTS custom_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    channel_url TEXT,
    platform TEXT,
    pieces TEXT NOT NULL,
    style_notes TEXT NOT NULL,
    reference_links TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    ip_hash TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_custom_requests_created ON custom_requests(created_at);
`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(ASSETS_DIR));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Scan `folderAbs` for the first file with one of the given extensions.
// Case-insensitive. Returns the absolute path, or null if the folder is
// missing/empty/no match. Used to resolve the slug-folder layout where
// `LandingPage/assets/zips/{slug}/` and `LandingPage/public/images/{slug}/`
// each hold a single PDF or PNG drop-in (filename doesn't matter).
const pickFileByExt = (folderAbs, exts) => {
  if (!folderAbs) return null;
  let entries;
  try {
    if (!fs.existsSync(folderAbs)) return null;
    entries = fs.readdirSync(folderAbs);
  } catch (_err) {
    return null;
  }
  const want = new Set(exts.map((e) => e.toLowerCase()));
  const matches = entries
    .filter((name) => !name.startsWith("."))
    .filter((name) => want.has(path.extname(name).toLowerCase()))
    .sort();
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.warn(
      `[widgets] multiple ${[...want].join("/")} files in ${folderAbs}; using ${matches[0]}`
    );
  }
  return path.join(folderAbs, matches[0]);
};

// Given a widgets.json entry, enrich it with resolved asset paths.
// Looks first at slug-folders (`assets/zips/{id}/` + `public/images/{id}/`),
// falls back to any explicit `zip` / `thumbnail` field for legacy entries.
// Returns a new object; does not mutate the input.
const resolveWidgetAssets = (entry) => {
  const slug = entry.id;
  const out = { ...entry };

  // Thumbnail resolution: folder first, then explicit field, then placeholder.
  const imgFolder = path.join(IMAGES_ROOT, slug);
  const imgAbs = pickFileByExt(imgFolder, [".png", ".jpg", ".jpeg", ".webp", ".svg"]);
  if (imgAbs) {
    out.thumbnail = `/public/images/${slug}/${path.basename(imgAbs)}`;
  } else if (entry.thumbnail) {
    // Legacy explicit path; leave as-is
  } else {
    out.thumbnail = PLACEHOLDER_THUMB;
  }

  // Zip/PDF resolution: folder first, then explicit field.
  const zipFolder = path.join(ZIPS_ROOT, slug);
  const zipAbs = pickFileByExt(zipFolder, [".pdf", ".zip"]);
  if (zipAbs) {
    // Stored as "{slug}/{filename}" so /download can reconstruct the full path.
    out.zip = `${slug}/${path.basename(zipAbs)}`;
    out.downloadAvailable = true;
  } else if (entry.zip) {
    out.downloadAvailable = true; // legacy flat path
  } else {
    out.downloadAvailable = false;
  }

  return out;
};

const loadWidgets = () => {
  const raw = fs.readFileSync(WIDGETS_PATH, "utf8");
  const entries = JSON.parse(raw);
  return entries.map(resolveWidgetAssets);
};

// Claimable freebies (the /claim flow). Entries default to freebie unless
// explicitly marked `"freebie": false` (store-only paid listings).
const freebieWidgets = (widgets) => widgets.filter((w) => w.freebie !== false);

// Curated catalog for /store and homepage. Upcoming kits may link to the shop.
// Bundles surface first, then newest publish date.
const publishedWidgets = (widgets) =>
  widgets
    .filter((w) => w.etsyUrl)
    .sort((a, b) => {
      const aBundle = a.productType === "bundle" ? 0 : 1;
      const bBundle = b.productType === "bundle" ? 0 : 1;
      if (aBundle !== bBundle) return aBundle - bBundle;
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    });

// Given a widget_id that could be either the canonical `id` or a legacy
// short form stored in `legacyId`, return the matching widget (resolved).
// Keeps old Kit confirmation emails (`widget_id=windows-95`) working after
// the slug rename.
const findWidget = (widgets, claimId) => {
  if (!claimId) return null;
  return (
    widgets.find((w) => w.id === claimId) ||
    widgets.find((w) => w.legacyId === claimId) ||
    null
  );
};

const hashIp = (ip) => {
  const salt = process.env.IP_SALT || "senergygroup";
  return crypto.createHash("sha256").update(`${ip}-${salt}`).digest("hex");
};

const formatHtml = (title, body, metaDescription = "") => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${metaDescription ? `<meta name="description" content="${escapeHtml(metaDescription)}" />` : ""}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/public/styles.css" />
    <meta name="p:domain_verify" content="1a8f352d71cf6353492c5dc37d5c87b5"/>
  </head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-EMZ8TTYWJ3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-EMZ8TTYWJ3');
  </script>
  <body>
    ${body}
  </body>
</html>`;

// Persistent top navigation. `active` marks the current page so visitors
// always know where they are ("pressed" taskbar button in the retro theme).
const NAV_ITEMS = [
  { key: "home", href: "/", label: "Home" },
  { key: "store", href: "/store", label: "Store" },
  { key: "claim", href: "/claim", label: "Free Widget" },
  { key: "custom", href: "/custom", label: "Custom Orders" },
  { key: "about", href: "/about", label: "About" },
];

const renderHeader = (active = "") => `
  <header class="site-header">
    <a class="brand" href="/"><span class="brand-icon">▞</span> ${BRAND_NAME}</a>
    <nav class="site-nav" aria-label="Main navigation">
      ${NAV_ITEMS.map(
        (item) =>
          `<a href="${item.href}" class="nav-btn${active === item.key ? " nav-active" : ""}"${active === item.key ? ' aria-current="page"' : ""}>${item.label}</a>`
      ).join("\n      ")}
    </nav>
  </header>
`;

const renderFooter = () => `
  <footer class="site-footer">
    <div class="footer-divider"></div>
    <div class="footer-cols">
      <div class="footer-col">
        <div class="footer-heading">Shop</div>
        <a href="/store">Widget Store</a>
        <a href="${addLandingUtm(ETSY_SHOP_URL, { slug: "shop", content: "footer" })}" target="_blank" rel="noopener noreferrer">Our Etsy Shop</a>
        <a href="/custom">Custom Orders</a>
      </div>
      <div class="footer-col">
        <div class="footer-heading">Free Stuff</div>
        <a href="/claim">Claim a Free Widget</a>
      </div>
      <div class="footer-col">
        <div class="footer-heading">Help</div>
        <a href="/about">About Us</a>
        <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
      </div>
    </div>
    <div class="privacy">We respect your inbox. No spam, ever. &copy; ${BRAND_NAME}</div>
  </footer>
`;

const aestheticLabel = (a) => {
  const labels = { windows: "Windows", retro: "Retro", cyberpunk: "Cyberpunk", cozy: "Cozy", y2k: "Y2K", irc: "IRC" };
  return labels[a] || (a.charAt(0).toUpperCase() + a.slice(1));
};

const formatPrice = (price) =>
  typeof price === "number" ? `$${price.toFixed(2)}` : "";

// Append GA4 UTM params to an outbound Etsy URL without clobbering existing
// query args. Kept parallel to tools/generate_guide.py's with_utm() so the
// guide PDFs and the landing page share a coherent attribution scheme:
// guides → utm_source=guide/utm_medium=pdf, landing → utm_source=senergy-landing/utm_medium=web.
const addLandingUtm = (rawUrl, { slug, content }) => {
  if (!rawUrl || rawUrl.trim() === "" || rawUrl.trim() === "#") return rawUrl || "";
  try {
    const parsed = new URL(rawUrl);
    const params = parsed.searchParams;
    if (!params.has("utm_source")) params.set("utm_source", "senergy-landing");
    if (!params.has("utm_medium")) params.set("utm_medium", "web");
    if (!params.has("utm_campaign")) params.set("utm_campaign", slug || "landing");
    if (!params.has("utm_content")) params.set("utm_content", content || "card-cta");
    return parsed.toString();
  } catch (_err) {
    return rawUrl;
  }
};

// Store-style product card (non-selectable; buy CTA goes to Etsy).
const renderStoreCard = (widget, utmContent) => `
  <div class="widget-card store-card${widget.productType === "bundle" ? " kit-store-card" : ""}" id="${escapeHtml(widget.id)}">
    <div class="widget-thumbnail" style="background-image: url('${widget.image || widget.thumbnail}')"></div>
    <div class="store-card-head">
      <div class="widget-name">${widget.name}</div>
      <div class="widget-price">${formatPrice(widget.price)}</div>
    </div>
    <div class="widget-desc">${widget.description}</div>
    <div class="store-card-foot">
      <span class="aesthetic-tag">${aestheticLabel(widget.aesthetic || "retro")}</span>
      ${widget.productType === "bundle" ? `<span class="bundle-tag">${escapeHtml(widget.badgeText || "Bundle")}</span>` : ""}
      <a class="buy-button"
         href="${addLandingUtm(widget.etsyUrl, { slug: widget.id, content: utmContent })}"
         target="_blank"
         rel="noopener noreferrer">${widget.etsyLinkType === "shop" ? "Visit Etsy shop" : "Buy on Etsy"} &rarr;</a>
    </div>
  </div>
`;

// A titled retro window wrapper: the core visual component of the site.
const win = (title, bodyHtml, extraClass = "") => `
  <section class="win ${extraClass}">
    <div class="win-title"><span class="win-title-text">${title}</span><span class="win-controls"><span>_</span><span>□</span><span>✕</span></span></div>
    <div class="win-body">${bodyHtml}</div>
  </section>
`;

/* ---------------------------------------------------------------------------
 * Homepage
 * ------------------------------------------------------------------------ */

const renderHomePage = (widgets) => {
  const published = publishedWidgets(widgets);
  const featured = published.slice(0, 6);
  const freebieCount = freebieWidgets(widgets).length;

  const hero = win(
    "welcome.exe",
    `
      <p class="eyebrow">Retro stream overlays &middot; StreamLabs + StreamElements</p>
      <h1>Stream like it's 1999.</h1>
      <p class="subhead">Coded chat widgets, alerts, scenes, and full stream kits for Twitch,
        built with real HTML/CSS/JS, not static images. Every widget installs in minutes
        and comes with a themed setup guide.</p>
      <div class="cta-row">
        <a class="primary-button" href="/store">Browse the Store</a>
        <a class="secondary-button" href="/claim">Claim a Free Widget</a>
      </div>
      <p class="microcopy">${published.length}+ widgets live on Etsy &middot; instant download &middot; support within 24 hours</p>
    `,
    "hero-win"
  );

  const whatWeMake = win(
    "what_we_make.dir",
    `
      <div class="type-grid">
        <a class="type-card" href="/store?type=chat">
          <div class="type-icon">💬</div>
          <div class="type-name">Chat Widgets</div>
          <div class="type-desc">Live chat overlays styled as CRT terminals, buddy lists, forums, inboxes, and more.</div>
        </a>
        <a class="type-card" href="/store?type=bundle">
          <div class="type-icon">🔔</div>
          <div class="type-name">Alert Widgets</div>
          <div class="type-desc">Follow, sub, tip, cheer, and raid pop-ups with retro chimes. Explore the ready-made kits to find your theme.</div>
        </a>
        <a class="type-card" href="/store?type=bundle">
          <div class="type-icon">🖥️</div>
          <div class="type-name">Scenes &amp; Goals</div>
          <div class="type-desc">Starting Soon, BRB, and Ending screens plus a themed goal bar. Explore the ready-made kits to find your theme.</div>
        </a>
        <a class="type-card" href="/store?type=bundle">
          <div class="type-icon">📦</div>
          <div class="type-name">Full Stream Kits</div>
          <div class="type-desc">Ready-made chat, alerts, scenes, goals, game frame, and panels in one matching theme. Buy and install today.</div>
        </a>
      </div>
    `
  );

  const featuredSection = win(
    "featured_widgets.dir",
    `
      <div class="widget-grid">
        ${featured.map((w) => renderStoreCard(w, "home-featured")).join("\n")}
      </div>
      <div class="center-row"><a class="secondary-button" href="/store">See everything in the store &rarr;</a></div>
    `
  );

  const customTeaser = win(
    "custom_orders.exe",
    `
      <div class="split-row">
        <div>
          <p class="eyebrow">Commissions open &middot; intro pricing</p>
          <h2>Want it in <em>your</em> style?</h2>
          <p>Every widget we sell can be rebuilt around your brand: your colors, your fonts,
            your theme. A full custom 8-piece stream kit starts at <strong>$199</strong>,
            single pieces from <strong>$35</strong>.</p>
        </div>
        <div class="split-cta">
          <a class="primary-button" href="/custom">Start a Custom Order</a>
          <p class="microcopy">Free quote &middot; no payment until you approve</p>
        </div>
      </div>
    `,
    "accent-win"
  );

  const freeTeaser = win(
    "free_widget.exe",
    `
      <div class="split-row">
        <div>
          <h2>Try one free first.</h2>
          <p>Pick any of ${freebieCount} chat widgets and we'll send it to your inbox.
            Full version, real install guide, no catch. You'll also get our monthly
            widget drops and community votes.</p>
        </div>
        <div class="split-cta">
          <a class="primary-button" href="/claim">Claim a Free Widget</a>
        </div>
      </div>
    `
  );

  const aboutStrip = win(
    "about_us.txt",
    `
      <p>${BRAND_NAME} is a small studio obsessed with the early internet. We build stream
        overlays the way software used to look, with Windows 95 chrome, dial-up modems, and CRT glow,
        but engineered for modern OBS setups. Sold on
        <a href="${addLandingUtm(ETSY_SHOP_URL, { slug: "shop", content: "home-about" })}" target="_blank" rel="noopener noreferrer">Etsy</a>
        with buyer protection and real human support.</p>
      <a class="secondary-link" href="/about">More about the shop &rarr;</a>
    `
  );

  return formatHtml(
    `${BRAND_NAME}: Retro Stream Overlays, Chat Widgets & Custom Stream Kits`,
    `
    ${renderHeader("home")}
    <main class="container">
      ${hero}
      ${whatWeMake}
      ${featuredSection}
      ${customTeaser}
      ${freeTeaser}
      ${aboutStrip}
    </main>
    ${renderFooter()}
  `,
    "Retro-themed chat widgets, alerts, scenes and full stream kits for Twitch. Coded for StreamLabs and StreamElements. Free widget for newsletter subscribers, custom commissions open."
  );
};

/* ---------------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------------ */

const renderStorePage = (widgets, activeAesthetic, activeType) => {
  const published = publishedWidgets(widgets);
  const byType = activeType ? published.filter((w) => w.productType === activeType) : published;
  const filtered = activeAesthetic ? byType.filter((w) => w.aesthetic === activeAesthetic) : byType;
  const aesthetics = [...new Set(byType.map((w) => w.aesthetic).filter(Boolean))].sort();
  const storeUrl = (type, aesthetic) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (aesthetic) params.set("aesthetic", aesthetic);
    return escapeHtml(`/store${params.size ? `?${params}` : ""}`);
  };

  const filterBar = `
    <nav class="filter-bar" aria-label="Filter by product type">
      ${[[null, "All products"], ["bundle", "Stream Kits & Bundles"], ["chat", "Chat Widgets"]].map(([type, label]) => `<a href="${storeUrl(type, null)}" class="filter-btn${activeType === type ? " filter-active" : ""}"${activeType === type ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`).join("\n      ")}
    </nav>
    <nav class="filter-bar" aria-label="Filter by aesthetic">
      <a href="${storeUrl(activeType, null)}" class="filter-btn${!activeAesthetic ? " filter-active" : ""}">All styles</a>
      ${aesthetics.map((a) => `<a href="${storeUrl(activeType, a)}" class="filter-btn${activeAesthetic === a ? " filter-active" : ""}">${aestheticLabel(a)}</a>`).join("\n      ")}
    </nav>
    <p class="filter-count">Showing ${filtered.length} of ${published.length} products</p>
  `;

  return formatHtml(
    `Widget Store | ${BRAND_NAME}`,
    `
    ${renderHeader("store")}
    <main class="container">
      ${win(
        "store.exe",
        `
        <p class="eyebrow">The full catalog</p>
        <h1>${activeType === "bundle" ? "Ready-made Stream Kits" : "Widget Store"}</h1>
        <p class="subhead">${activeType === "bundle" ? "Complete your stream with a ready-made kit." : "Explore our chat widgets and ready-made stream kits."} Purchases go through our Etsy shop:
          instant digital download, buyer protection, and a themed install guide with every order.</p>
        `,
        "hero-win"
      )}
      ${filterBar}
      <div class="widget-grid">
        ${filtered.map((w) => renderStoreCard(w, "store-cta")).join("\n")}
      </div>
      ${filtered.length ? "" : '<p class="notice">No products in this style yet. <a href="/store">Browse all products</a>.</p>'}
      ${win(
        "psst.txt",
        `
        <div class="split-row">
          <p style="margin:0">Don't see your style? We take commissions, with a full custom stream kit
            from <strong>$199</strong>.</p>
          <a class="secondary-button" href="/custom">Custom Orders &rarr;</a>
        </div>
        `
      )}
    </main>
    ${renderFooter()}
  `,
    "Browse all retro Twitch stream widgets by SenergyGroup: CRT terminals, Windows 95/XP chat boxes, cyberpunk HUDs, cozy pixel overlays. Sold on Etsy."
  );
};

/* ---------------------------------------------------------------------------
 * Custom orders
 * ------------------------------------------------------------------------ */

const renderCustomPage = (errorMessage = "", formValues = {}) => {
  const v = (key) => escapeHtml(formValues[key] || "");
  const checked = (key) =>
    Array.isArray(formValues.pieces) && formValues.pieces.includes(key) ? " checked" : "";

  const pricingRows = CUSTOM_PIECES.map(
    (p) => `
      <tr${p.highlight ? ' class="pricing-highlight"' : ""}>
        <td><strong>${p.label}</strong>${p.highlight ? ' <span class="deal-tag">Save $117</span>' : ""}<div class="pricing-includes">${p.includes}</div></td>
        <td class="pricing-price">from $${p.price}</td>
      </tr>`
  ).join("\n");

  const pieceChecks = CUSTOM_PIECES.map(
    (p) => `
      <label class="check-row">
        <input type="checkbox" name="pieces" value="${p.key}"${checked(p.key)} />
        <span>${p.label} <span class="check-price">from $${p.price}</span></span>
      </label>`
  ).join("\n");

  return formatHtml(
    `Custom Stream Widget Commissions | ${BRAND_NAME}`,
    `
    ${renderHeader("custom")}
    <main class="container">
      ${win(
        "custom_orders.exe",
        `
        <p class="eyebrow">Commissions open &middot; intro pricing while we build our portfolio</p>
        <h1>Your stream. Your style. Our code.</h1>
        <p class="subhead">We take the same 8-piece framework behind our stream kits and rebuild it
          around <em>your</em> brand: colors, fonts, logo, theme. Real coded widgets for StreamLabs
          and StreamElements, not static PNGs.</p>
        `,
        "hero-win"
      )}

      ${win(
        "how_it_works.txt",
        `
        <ol class="steps">
          <li><strong>Tell us your style.</strong> Fill in the form below with your channel, the pieces you want, and any references. Takes 2 minutes.</li>
          <li><strong>Get your quote.</strong> We reply within 48 hours with a firm price and a mockup direction. If you're in, we set up a private Etsy listing just for you, so payment, reviews, and buyer protection all stay on Etsy.</li>
          <li><strong>Receive your widgets.</strong> Delivery in 1–2 weeks with a themed install guide. Two revision rounds included.</li>
        </ol>
        `
      )}

      ${win(
        "price_list.xls",
        `
        <table class="pricing-table">
          <thead><tr><th>Piece</th><th>Intro price</th></tr></thead>
          <tbody>${pricingRows}</tbody>
        </table>
        <p class="microcopy">"From" pricing: unusually complex requests may quote higher, and you'll
          always see the final price before paying anything. Intro rates while our commission
          portfolio grows; they won't stay this low.</p>
        `
      )}

      ${win(
        "request_form.exe",
        `
        ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
        <form class="custom-form" action="/custom" method="POST">
          <div class="form-grid">
            <div class="form-row">
              <label for="name">Your name</label>
              <input id="name" name="name" type="text" value="${v("name")}" required maxlength="120" />
            </div>
            <div class="form-row">
              <label for="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" value="${v("email")}" required maxlength="254" />
            </div>
            <div class="form-row">
              <label for="channel_url">Channel link <span class="optional">(optional)</span></label>
              <input id="channel_url" name="channel_url" type="url" placeholder="https://twitch.tv/yourchannel" value="${v("channel_url")}" maxlength="300" />
            </div>
            <div class="form-row">
              <label for="platform">Platform</label>
              <select id="platform" name="platform">
                <option value="streamelements"${formValues.platform === "streamelements" ? " selected" : ""}>StreamElements</option>
                <option value="streamlabs"${formValues.platform === "streamlabs" ? " selected" : ""}>StreamLabs</option>
                <option value="both"${formValues.platform === "both" ? " selected" : ""}>Both / not sure</option>
              </select>
            </div>
          </div>
          <fieldset class="form-row">
            <legend>Which pieces do you want?</legend>
            ${pieceChecks}
          </fieldset>
          <div class="form-row">
            <label for="style_notes">Describe your style</label>
            <textarea id="style_notes" name="style_notes" rows="5" required maxlength="4000"
              placeholder="e.g. Vaporwave sunset palette, pink/teal, my mascot is a pixel cat, vibe like an old karaoke machine...">${v("style_notes")}</textarea>
          </div>
          <div class="form-row">
            <label for="reference_links">Reference links <span class="optional">(optional: Pinterest boards, screenshots, other overlays you like)</span></label>
            <textarea id="reference_links" name="reference_links" rows="3" maxlength="2000">${v("reference_links")}</textarea>
          </div>
          <div class="hp-field" aria-hidden="true">
            <label for="website">Website</label>
            <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <button type="submit" class="primary-button">Request my free quote</button>
          <p class="microcopy">No payment now. We reply within 48 hours with a quote. Payment happens
            later through a private Etsy listing.</p>
        </form>
        `
      )}

      ${win(
        "faq.txt",
        `
        <dl class="faq">
          <dt>Which platforms do you support?</dt>
          <dd>StreamLabs and StreamElements both work with OBS, Streamlabs Desktop, and Twitch Studio. Alerts, scenes, and goals are StreamElements-based; chat widgets are available on both.</dd>
          <dt>How do I pay?</dt>
          <dd>Once you approve the quote, we create a private Etsy listing reserved for you. You check out on Etsy like any other purchase, with full buyer protection included.</dd>
          <dt>What do I actually receive?</dt>
          <dd>Installable widget files/URLs plus a themed PDF install guide. No ZIP-file mysteries, just the same delivery our store products use.</dd>
          <dt>What if I don't like it?</dt>
          <dd>Two revision rounds are included in every commission. We share the design direction before building, so surprises are rare.</dd>
        </dl>
        `
      )}
    </main>
    ${renderFooter()}
  `,
    "Commission a custom Twitch stream overlay: chat widget, alerts, scenes, goal bar, panels, coded for StreamLabs & StreamElements in your style. Full custom kit from $199."
  );
};

const renderCustomThanksPage = (name) =>
  formatHtml(
    "Request received!",
    `
    ${renderHeader("custom")}
    <main class="container narrow">
      ${win(
        "request_sent.exe",
        `
        <div class="success-icon">✓</div>
        <h1>Got it${name ? `, ${escapeHtml(name)}` : ""}!</h1>
        <p class="subhead">Your custom widget request is in the queue.</p>
        <p>We'll reply from <strong>${SUPPORT_EMAIL}</strong> within 48 hours with a quote and
          design direction. Add us to your contacts so we don't land in spam.</p>
        <div class="button-group">
          <a class="secondary-button" href="/store">Browse the store while you wait</a>
          <a class="secondary-button" href="/claim">Claim a free widget</a>
        </div>
        `
      )}
    </main>
    ${renderFooter()}
  `
  );

/* ---------------------------------------------------------------------------
 * About
 * ------------------------------------------------------------------------ */

const renderAboutPage = (widgets) => {
  const published = publishedWidgets(widgets);
  return formatHtml(
    `About | ${BRAND_NAME}`,
    `
    ${renderHeader("about")}
    <main class="container narrow">
      ${win(
        "about_us.txt",
        `
        <p class="eyebrow">Est. on the early internet</p>
        <h1>We make streams look like 1999.</h1>
        <p>${BRAND_NAME} is a small studio building retro-themed stream overlays: Windows 95 windows,
          CRT terminals, dial-up logs, buddy lists, cozy pixel scenes. ${published.length}+ widgets live
          on Etsy and counting, with new drops every month.</p>
        <p>The difference from most overlay shops: our widgets are <strong>real coded software</strong>,
          not static images. Chat messages actually render inside the theme. Alerts actually pop.
          Goal bars actually fill. Everything ships with configurable colors, fonts, and settings,
          plus a themed install guide that walks you through setup in minutes.</p>
        `,
        "hero-win"
      )}
      ${win(
        "why_us.txt",
        `
        <ul class="feature-list">
          <li><strong>Functional, not flat.</strong> Live chat, alert events, and goals rendered in-theme with real HTML/CSS/JS.</li>
          <li><strong>Both platforms.</strong> Built for StreamLabs and StreamElements, with no vendor lock-in.</li>
          <li><strong>No ZIP-file mysteries.</strong> Install via theme URLs and guided copy-paste. Every order includes a themed PDF guide.</li>
          <li><strong>Human support.</strong> Email us and a real person replies within 24 hours.</li>
        </ul>
        `
      )}
      ${win(
        "get_in_touch.exe",
        `
        <div class="button-group">
          <a class="primary-button" href="/store">Browse the Store</a>
          <a class="secondary-button" href="/custom">Commission a Custom Kit</a>
          <a class="secondary-button" href="${addLandingUtm(ETSY_SHOP_URL, { slug: "shop", content: "about-cta" })}" target="_blank" rel="noopener noreferrer">Visit our Etsy Shop</a>
        </div>
        <p class="microcopy">Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. Response within 24 hours.</p>
        `
      )}
    </main>
    ${renderFooter()}
  `,
    "SenergyGroup builds retro-themed, fully coded stream overlays for Twitch on StreamLabs and StreamElements. About the shop, our approach, and custom commissions."
  );
};

/* ---------------------------------------------------------------------------
 * Claim flow (existing free-widget funnel, unchanged behavior)
 * ------------------------------------------------------------------------ */

const renderClaimPage = (allWidgets, activeAesthetic, errorMessage = "") => {
  const claimable = freebieWidgets(allWidgets);
  const filtered = activeAesthetic
    ? claimable.filter((w) => w.aesthetic === activeAesthetic)
    : claimable;

  const aesthetics = [...new Set(claimable.map((w) => w.aesthetic).filter(Boolean))].sort();

  const filterBar = `
    <nav class="filter-bar" aria-label="Filter by aesthetic">
      <a href="/claim" class="filter-btn${!activeAesthetic ? " filter-active" : ""}">All</a>
      ${aesthetics.map((a) => `<a href="/claim?aesthetic=${a}" class="filter-btn${activeAesthetic === a ? " filter-active" : ""}">${aestheticLabel(a)}</a>`).join("\n      ")}
    </nav>
    <p class="filter-count">Showing ${filtered.length} of ${claimable.length} widgets</p>
  `;

  const widgetCards = filtered
    .map((widget) => {
      const etsyLink = widget.etsyUrl
        ? `
        <a class="widget-etsy-link"
           href="${addLandingUtm(widget.etsyUrl, { slug: widget.id, content: "card-cta" })}"
           target="_blank"
           rel="noopener noreferrer">View on Etsy &rarr;</a>`
        : "";
      return `
      <label class="widget-card">
        <input type="radio" name="widget_id" value="${widget.id}" required />
        <div class="widget-thumbnail" style="background-image: url('${widget.thumbnail}')"></div>
        <div class="widget-name">${widget.name}</div>
        <div class="widget-desc">${widget.description}</div>${etsyLink}
      </label>
    `;
    })
    .join("\n");

  return formatHtml(
    "Claim your free widget",
    `
    ${renderHeader("claim")}
    <main class="container">
      <section class="hero">
        <p class="eyebrow">Free Streamlabs Bonus</p>
        <h1>Claim your free Streamlabs chat widget</h1>
        <p class="subhead">Choose one theme. Confirm your email. Get instant download access.</p>
        ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
      </section>
      <form class="claim-form" action="/claim" method="POST">
        ${filterBar}
        <div class="widget-grid">${widgetCards}</div>
        <div class="form-row" id="claim-email-section">
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <button type="submit" class="primary-button">Send me my widget</button>
        <p class="microcopy">By claiming your widget, you agree to join the SenergyGroup newsletter.
          We'll send you monthly widget drops and community votes.
          No spam. Unsubscribe with one click at any time.</p>
      </form>
    </main>
    ${renderFooter()}
    <script>
      // When a visitor picks a widget, glide down to the email field so it's
      // obvious they still need to enter an email and hit "Send me my widget".
      (function () {
        var form = document.querySelector(".claim-form");
        if (!form) return;
        var emailSection = document.getElementById("claim-email-section");
        var emailInput = document.getElementById("email");
        form.addEventListener("change", function (event) {
          if (!event.target || event.target.name !== "widget_id") return;
          if (emailSection && emailSection.scrollIntoView) {
            emailSection.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          if (emailInput) {
            setTimeout(function () {
              try { emailInput.focus({ preventScroll: true }); }
              catch (err) { emailInput.focus(); }
            }, 450);
          }
        });
      })();
    </script>
  `
  );
};

const renderCheckEmailPage = (email) =>
  formatHtml(
    "Check your email",
    `
    ${renderHeader("claim")}
    <main class="container narrow">
      <section class="message-card">
        <h1>Check your inbox to confirm your email</h1>
        <p>We sent a confirmation email to <strong>${escapeHtml(email)}</strong>.</p>
        <p>Once confirmed, you'll unlock your download instantly.</p>
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
    ${renderHeader("claim")}
    <main class="container narrow">
      <section class="message-card">
        <div class="success-icon">✓</div>
        <h1>Success!</h1>
        <br />
        <h2>Your widget is ready to download</h2>
        <p class="subhead">The <strong>${widget.name}</strong> theme has been unlocked.</p>

        <div class="widget-preview">
          <div class="widget-thumbnail large" style="background-image: url('${widget.thumbnail}')"></div>
          <div class="widget-info">
            <div class="widget-name">${widget.name}</div>
            <div class="widget-desc">${widget.description}</div>
          </div>
        </div>

        <div class="button-group">
          <a class="primary-button" href="/download/${claim.claim_token}">Download File</a>
          <a class="secondary-button" href="${addLandingUtm(ETSY_SHOP_URL, { slug: "shop", content: "confirmed-cta" })}" target="_blank" rel="noopener noreferrer">Browse Our Other Themes on Etsy</a>
        </div>

        <div class="install-notes-callout">
          <h4>StreamLabs Installation Note</h4>
          <p>Perform the setup in the <strong>browser</strong>. The Streamlabs desktop app doesn't support the custom field configuration steps. Clicking the link in the PDF will open the widget in the browser.</p>
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
        <a class="secondary-button" href="/">Return to home page</a>
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

const customRateLimitReached = (ipHash) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM custom_requests WHERE ip_hash = ? AND created_at >= ?"
    )
    .get(ipHash, oneHourAgo);
  return row.count >= 3;
};

const createOrUpdateSubscriber = async ({ email, token, widgetId }) => {
  if (!KIT_API_KEY || !KIT_FORM_ID) {
    console.error("Missing Kit Credentials in .env");
    return null; // Return null instead of an object to make the next part easier
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
    const response = await fetch(`https://api.kit.com/v3/forms/${KIT_FORM_ID}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("--- Kit API Error ---");
      console.error(JSON.stringify(data, null, 2));
      throw new Error(`Kit error: ${response.status}`);
    }

    // Capture the ID. Kit puts it in different places based on if the user is new or existing.
    // We check: subscription.subscriber.id OR subscription.id
    const kitId = data.subscription?.subscriber?.id || data.subscription?.id;

    console.log(`--- Kit Success ---`);
    console.log(`Subscriber: ${email} | Captured Kit ID: ${kitId}`);

    return kitId;
  } catch (error) {
    console.error("Network or Kit Error:", error.message);
    throw error;
  }
};

/* ---------------------------------------------------------------------------
 * Routes
 * ------------------------------------------------------------------------ */

app.get("/", (req, res) => {
  res.send(renderHomePage(loadWidgets()));
});

app.get("/store", (req, res) => {
  const aesthetic = typeof req.query.aesthetic === "string" ? req.query.aesthetic : null;
  const type = ["bundle", "chat"].includes(req.query.type) ? req.query.type : null;
  res.send(renderStorePage(loadWidgets(), aesthetic, type));
});

app.get("/about", (req, res) => {
  res.send(renderAboutPage(loadWidgets()));
});

app.get("/custom", (req, res) => {
  res.send(renderCustomPage());
});

app.post("/custom", (req, res) => {
  const { name, email, channel_url: channelUrl, platform, style_notes: styleNotes, reference_links: referenceLinks, website } = req.body;
  let pieces = req.body.pieces || [];
  if (!Array.isArray(pieces)) pieces = [pieces];
  const validKeys = new Set(CUSTOM_PIECES.map((p) => p.key));
  pieces = pieces.filter((p) => validKeys.has(p));

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (website) {
    res.redirect("/custom/thanks");
    return;
  }

  const formValues = { name, email, channel_url: channelUrl, platform, style_notes: styleNotes, reference_links: referenceLinks, pieces };

  if (!name || !email || !styleNotes || pieces.length === 0) {
    res.status(400).send(renderCustomPage("Please fill in your name, email, style description, and pick at least one piece.", formValues));
    return;
  }

  const ipHash = hashIp(req.ip || "unknown");
  if (customRateLimitReached(ipHash)) {
    res.status(429).send(renderCustomPage("You've sent a few requests already, and we'll get back to you soon! Try again later or email us directly.", formValues));
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO custom_requests
      (id, name, email, channel_url, platform, pieces, style_notes, reference_links, status, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
  ).run(
    crypto.randomUUID(),
    String(name).slice(0, 120),
    String(email).slice(0, 254),
    channelUrl ? String(channelUrl).slice(0, 300) : null,
    platform ? String(platform).slice(0, 30) : null,
    pieces.join(","),
    String(styleNotes).slice(0, 4000),
    referenceLinks ? String(referenceLinks).slice(0, 2000) : null,
    ipHash,
    now
  );

  console.log(`--- New custom request --- ${email} | pieces: ${pieces.join(",")}`);
  res.redirect(`/custom/thanks?name=${encodeURIComponent(String(name).split(" ")[0] || "")}`);
});

app.get("/custom/thanks", (req, res) => {
  res.send(renderCustomThanksPage(req.query.name || ""));
});

// Lightweight owner view of incoming commission requests.
// Requires ADMIN_KEY in .env; /admin/requests?key=... to view.
app.get("/admin/requests", (req, res) => {
  if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) {
    res.status(404).send(renderErrorPage("Page not found."));
    return;
  }
  const rows = db
    .prepare("SELECT * FROM custom_requests ORDER BY created_at DESC LIMIT 200")
    .all();
  const table = rows.length
    ? `<div class="table-scroll"><table class="pricing-table admin-table">
        <thead><tr><th>When</th><th>Name</th><th>Email</th><th>Channel</th><th>Platform</th><th>Pieces</th><th>Style notes</th><th>References</th></tr></thead>
        <tbody>
        ${rows
          .map(
            (r) => `<tr>
              <td>${escapeHtml((r.created_at || "").slice(0, 16).replace("T", " "))}</td>
              <td>${escapeHtml(r.name)}</td>
              <td><a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email)}</a></td>
              <td>${r.channel_url ? `<a href="${escapeHtml(r.channel_url)}" target="_blank" rel="noopener noreferrer">link</a>` : ""}</td>
              <td>${escapeHtml(r.platform || "")}</td>
              <td>${escapeHtml(r.pieces)}</td>
              <td class="notes-cell">${escapeHtml(r.style_notes)}</td>
              <td class="notes-cell">${escapeHtml(r.reference_links || "")}</td>
            </tr>`
          )
          .join("\n")}
        </tbody>
      </table></div>`
    : "<p>No custom requests yet.</p>";
  res.send(
    formatHtml(
      "Custom Requests | Admin",
      `
      ${renderHeader()}
      <main class="container">
        ${win("custom_requests.db", `<h1>Custom Requests (${rows.length})</h1>${table}`)}
      </main>
      ${renderFooter()}
    `
    )
  );
});

app.get("/claim", (req, res) => {
  const widgets = loadWidgets();
  const aesthetic = req.query.aesthetic || null;
  res.send(renderClaimPage(widgets, aesthetic));
});

app.post("/claim", async (req, res) => {
  const { email, widget_id: widgetId } = req.body;
  const widgets = loadWidgets();
  const widget = findWidget(widgets, widgetId);

  if (!email || !widget) {
    res.status(400).send(renderClaimPage(widgets, null, "Please choose a widget and enter an email."));
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

  let capturedKitId = null;

  try {
    // We now get the ID directly back from the function
    capturedKitId = await createOrUpdateSubscriber({ email, token: claimToken, widgetId });
  } catch (error) {
    res.status(502).send(renderErrorPage("We could not send your confirmation email. Please try again."));
    return;
  }

  // Double check our logs to see if we are about to save a NULL or a real ID
  console.log(`Attempting to save claim for ${email} with Kit ID: ${capturedKitId}`);

  db.prepare(
    `INSERT INTO widget_claims
      (id, email, widget_id, status, kit_subscriber_id, claim_token, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(claimId, email, widgetId, "submitted", capturedKitId ? capturedKitId.toString() : null, claimToken, ipHash, now);

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
  const widget = findWidget(widgets, claim.widget_id);

  if (!widget) {
    res.status(404).send(renderErrorPage("We could not locate the widget details."));
    return;
  }

  res.send(renderConfirmedPage(claim, widget));
});

app.get("/download/:token", (req, res) => {
  const token = req.params.token;
  const claim = db.prepare("SELECT * FROM widget_claims WHERE claim_token = ?").get(token);

  if (!claim || !["confirmed", "delivered"].includes(claim.status)) {
    res.status(403).send(renderErrorPage("Please confirm your email before downloading."));
    return;
  }

  const widgets = loadWidgets();
  const widget = findWidget(widgets, claim.widget_id);

  if (!widget) {
    res.status(404).send(renderErrorPage("Widget download is unavailable."));
    return;
  }

  if (!widget.downloadAvailable || !widget.zip) {
    res.status(404).send(renderErrorPage("This widget is not yet downloadable. Please contact support."));
    return;
  }

  if (DOWNLOAD_BASE_URL) {
    // A redirect is not evidence that the external host completed a download.
    res.redirect(`${DOWNLOAD_BASE_URL.replace(/\/+$/, "")}/${widget.zip}`);
    return;
  }

  const zipPath = path.join(ZIPS_ROOT, widget.zip);
  const downloadName = path.basename(widget.zip);
  res.download(zipPath, downloadName, (err) => {
    if (err) {
      // A cancelled or partially sent response cannot accept a second response.
      // Leave the claim usable so the buyer can retry on this or another device.
      if (req.aborted || res.destroyed || res.writableEnded) return;
      if (res.headersSent) {
        res.destroy();
        return;
      }
      res.removeHeader("Content-Disposition");
      res.status(err.statusCode === 404 || err.code === "ENOENT" ? 404 : 500)
        .send(renderErrorPage("Download failed. Please try this link again or contact support."));
      return;
    }
    if (req.method === "HEAD") return;
    const deliveredAt = new Date().toISOString();
    db.prepare("UPDATE widget_claims SET status = ?, delivered_at = COALESCE(delivered_at, ?) WHERE id = ?").run(
      "delivered",
      deliveredAt,
      claim.id
    );
  });
});

// Panel Makers: self-serve Twitch panel generators for kit buyers.
// Static pages live in public/panel-makers/{family}.html; the whitelist keeps
// the URL space tight and prevents path tricks. Add new kit families here.
const PANEL_MAKER_FAMILIES = new Set(["retro-messenger", "irc-minimal", "windows-xp"]);
app.get("/panel-maker/:family", (req, res) => {
  const family = String(req.params.family || "").toLowerCase();
  if (!PANEL_MAKER_FAMILIES.has(family)) {
    res.status(404).send(renderErrorPage("Page not found."));
    return;
  }
  res.sendFile(path.join(ASSETS_DIR, "panel-makers", `${family}.html`));
});

app.use((req, res) => {
  res.status(404).send(renderErrorPage("Page not found."));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
