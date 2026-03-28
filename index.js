const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.all('/shopify/*', async (req, res) => {
  const path = req.params[0];
  const url = `https://huxi.myshopify.com/admin/api/2026-01/${path}`;
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: ['POST','PUT','PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/test', async (req, res) => {
  try {
    const response = await fetch('https://huxi.myshopify.com/admin/api/2026-01/shop.json', {
      headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN }
    });
    const data = await response.json();
    res.json({ status: response.status, shop: data.shop?.name || 'connected' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running'));
