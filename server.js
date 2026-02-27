import express from 'express';
import https from 'https';
import http from 'http';

const app = express();
const PORT = 3001;

// CORS pour permettre au frontend (port 3000) d'appeler ce serveur
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Route proxy pour Overpass API
app.post('/api/mosques', (req, res) => {
  const overpassQuery = req.body;

  if (!overpassQuery) {
    return res.status(400).json({ error: 'Missing query body' });
  }

  const postData = 'data=' + encodeURIComponent(overpassQuery);

  const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'IslamApp/1.0 (educational project)',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.setEncoding('utf8');
    proxyRes.on('data', (chunk) => { data += chunk; });
    proxyRes.on('end', () => {
      // Vérifier que c'est bien du JSON et pas une erreur XML
      if (data.startsWith('<')) {
        console.error('Overpass returned XML error:', data.substring(0, 200));
        return res.status(503).json({ error: 'Overpass API temporarily unavailable', raw: data.substring(0, 200) });
      }
      try {
        const parsed = JSON.parse(data);
        res.json(parsed);
      } catch (e) {
        res.status(500).json({ error: 'Invalid JSON from Overpass', raw: data.substring(0, 200) });
      }
    });
  });

  proxyReq.on('error', (e) => {
    console.error('Proxy request error:', e.message);
    res.status(500).json({ error: e.message });
  });

  proxyReq.write(postData);
  proxyReq.end();
});

// Route de santé pour vérifier que le serveur tourne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server running' });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`   Overpass API proxy: POST http://localhost:${PORT}/api/mosques`);
});
