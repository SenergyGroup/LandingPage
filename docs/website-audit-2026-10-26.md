# Website audit corrections - October 26, 2026

Status: local review; do not push or deploy without the owner's approval.

## Verified checkout and deployment

- Website: `C:\Users\Home\Documents\Claude Senergy Group\LandingPage`.
- This is a separate repository from the parent product factory.
- Remote: `https://github.com/SenergyGroup/LandingPage.git`, branch `main`.
- Starting local and remote main: `81c6e853b03abd9837ca2f85e3d303bee6147e95`.
- The website checkout was clean before this task. No parent product files changed.
- Existing release documentation identifies Render service `LandingPage`, ID
  `srv-d60cpkp4tr6s73e9vhhg`, source `SenergyGroup/LandingPage:main`, build
  `npm install`, start `node server.js`, persistent disk `/data`.
- Current Render settings could not be read: the service Settings URL redirected
  to Sign In. Auto-deploy is therefore unverified. Treat pushing `main` as capable
  of publishing immediately. No deployment configuration, disk, or live settings
  were changed. There is no tracked Render blueprint or GitHub Actions deployment
  workflow in this checkout.

## Findings and changes

Live `/claim` opened all 25 widgets in a normal browser. The three audited panel
routes opened the correct desktop app. Their outer HTML deliberately contains the
desktop shell; inspecting only that HTML does not establish a homepage fallback.
The public claim response was HTTP 200 with Cloudflare `CF-Cache-Status: DYNAMIC`.
No reproducible cache or deployment rewrite problem was found.

Reproduced navigation defects:

1. Changing a picker filter set `iframe.src` and called `history.pushState`.
   One Back click changed the inner document while the address bar still showed
   the filtered URL; a second Back was needed. Frame navigation now replaces the
   inner history entry, leaving desktop navigation in charge of Back/Forward.
2. Direct Store wrappers rebuilt a limited query string; Panel Maker wrappers
   dropped the query altogether. They now preserve the requested URL, and initial
   client navigation also passes through the hash to the embedded tool.
3. The initial iframe had only `data-src`; no-script links returned to the same
   wrapper. The initially opened tool now has a real `src`, and no-script links
   lead to `embedded=1` content. The retro desktop remains the regular experience.

The picker now has a primary **Choose this free widget** button and a separate
**Preview on Etsy** link where an active listing exists. Native radio selection,
selection highlighting and scroll/focus to email remain. The email section names
the selected widget and its platform support, and the submit button names its
free setup guide. The offer is an extra thank-you theme for joining the newsletter.
No freebie was removed, added, or converted to paid; kit purchases remain separate.

All 25 actual downloadable PDFs were inspected. Each contains Streamlabs and
StreamElements installation links and no-code setup instructions. Per-widget
`claimPlatforms` metadata records that verified support, rather than inferring it
from a product name or an audit mockup. Evidence hashes and link hosts are in
`freebie-platform-audit-2026-10-26.json`; no private install tokens are included.
New guides should be inspected before updating this metadata. The initial Store
window and welcome copy now explicitly explain no-code installation via the PDF
install links and an OBS browser source.

Form verification exposed two additional funnel defects: POST accepted paid-only
IDs, and missing Kit credentials could create a claim and show "check your email"
without sending anything. POST now validates email and freebie availability before
Kit; missing settings, failed API replies and missing subscriber IDs show an error.
Validation errors preserve the chosen widget. Existing confirmation and repeat
download logic is unchanged.

## Validation

- `npm test`: **18 passed, 0 failed**. Uses disposable fixture files, in-memory
  SQLite, no production `.env`, and mocked/blocked external requests. Covers
  route wrappers/queries/fallbacks, 25-widget metadata and selection controls,
  invalid email/paid-only/missing download rejection, mock Kit success/failure,
  repeat/cancelled/HEAD downloads, catalog integrity, and preview isolation.
- `node --check server.js`, `public/desktop.js`, and `public/claim.js`: passed.
  This Express application has no separate build command.
- Browser QA at 1280 x 720: direct loads and refresh for `/claim`, `/store` and
  all three panel families, including filters, `view=listings`, `utm_source`,
  and a Store product hash. Correct app, content, and URL preserved.
- Internal navigation and one-step Back/Forward passed for picker filters,
  Store filters, and directory-to-editor navigation for Retro Messenger,
  IRC Minimal, and Windows XP.
- Desktop selection, selection highlight, selected-name submit text, email focus,
  invalid-email state, and keyboard activation verified without submission.
- Fresh-tab checks: interactive preview plays; Windows XP panel text changes its
  rendered artwork. These fresh-tab smoke checks had no console errors.
- 390 x 700 layout checked inside a local responsive test frame (actual child
  viewport measured 390px). Single-column cards and email content fit; inner
  content width was 359px with no horizontal overflow. The browser viewport API
  had no effect, and nested-frame pointer/keyboard automation was unreliable.
  This is visual responsive coverage, not a physical-phone/touch test.

## Remaining release limits

No real email was submitted; no subscribers, Kit data, paid guides, or live
settings changed. Inbox delivery, confirmation email configuration, real account
installation, and production download transfer still require a separately
authorized end-to-end check. Local guide files and mocked fulfillment were checked.
The Render auto-deploy setting requires an authenticated settings review.

After approval, from this website checkout, the intended command is
`git push origin main`. It targets the existing Render source branch and may
immediately make the changes live. Do not run it as a routine code-only push.
