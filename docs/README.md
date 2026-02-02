# SenergyGroup Free Widget Picker

## Overview
This app provides the landing flow for claiming one free Streamlabs widget, confirming email via Kit (ConvertKit), and serving the correct download package.

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

## Widget configuration

Widget definitions live in `config/widgets.json`:

```json
{
  "id": "aurora-glass",
  "name": "Aurora Glass",
  "description": "Soft gradients...",
  "thumbnail": "/public/images/aurora-glass.svg",
  "zip": "aurora-glass.zip"
}
```

### Adding a new widget

1. Upload the widget thumbnail to `public/images/`.
2. Upload the widget ZIP file to `assets/zips/` or your object storage. (ZIPs are not committed in this repo.)
3. Add a new entry to `config/widgets.json`.

If you are hosting ZIPs on object storage, set `DOWNLOAD_BASE_URL` to the public or signed base URL and keep the file name in the `zip` field.

## Editing landing copy

All landing page copy lives in `server.js`. Update the content in `renderClaimPage`, `renderCheckEmailPage`, and `renderConfirmedPage` as needed.

## Render deployment notes

- Set `PORT` and `NODE_ENV` in the Render service environment.
- Persist the SQLite database by mounting a disk or migrate to a managed Postgres.
- Ensure `KIT_API_KEY` and `KIT_FORM_ID` are set to enable confirmation emails.

## Analytics

Add your analytics snippet in `public/styles.css` or via your preferred middleware in `server.js`.