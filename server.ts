import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiApp } from './server/apiApp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Mount SentinelX API
app.use(apiApp);

// In production, serve the built static assets from dist/
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SentinelX Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[SentinelX Server] Gemini API Status: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Fallback Mode'}`);
});
