// Safe-by-default preview: loopback only, disposable DB, no .env, forms or analytics.
process.env.LOCAL_PREVIEW = '1';
process.env.PORT = process.env.PREVIEW_PORT || '4173';
await import('../server.js');
