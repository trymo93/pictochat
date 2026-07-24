#!/usr/bin/env node
// PictoChat locale — server a zero dipendenze.
// Avvio: node server.js   (poi gli altri si collegano all'IP mostrato)

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const MAX_HISTORY = 40;          // messaggi tenuti in memoria per stanza
const MAX_BODY = 2 * 1024 * 1024; // 2 MB: un PNG del canvas è ~10-50 KB
const ROOMS = ['A', 'B', 'C', 'D'];

const rooms = new Map(); // nome -> { clients: Set<res>, history: [] }

function getRoom(name) {
  if (!rooms.has(name)) rooms.set(name, { clients: new Set(), history: [] });
  return rooms.get(name);
}

function sseSend(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(roomName, event, data) {
  const room = getRoom(roomName);
  for (const client of room.clients) sseSend(client, event, data);
}

function handleEvents(req, res, url) {
  const roomName = url.searchParams.get('room');
  if (!ROOMS.includes(roomName)) {
    res.writeHead(400);
    return res.end('stanza non valida');
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    'Connection': 'keep-alive',
  });
  res.write(':ok\n\n');

  const room = getRoom(roomName);
  room.clients.add(res);
  for (const msg of room.history) sseSend(res, 'msg', msg);
  broadcast(roomName, 'presence', { online: room.clients.size });

  // keep-alive: alcuni telefoni chiudono le connessioni silenziose
  const ping = setInterval(() => res.write(':ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(ping);
    room.clients.delete(res);
    broadcast(roomName, 'presence', { online: room.clients.size });
  });
}

function handleSend(req, res) {
  let size = 0;
  const chunks = [];
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY) {
      res.writeHead(413);
      res.end('messaggio troppo grande');
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      res.writeHead(400);
      return res.end('json non valido');
    }
    const { room, name, color, image } = body;
    if (!ROOMS.includes(room) ||
        typeof name !== 'string' || !name.trim() || name.length > 24 ||
        typeof image !== 'string' || !image.startsWith('data:image/png;base64,')) {
      res.writeHead(400);
      return res.end('messaggio non valido');
    }
    const msg = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : '#3aa0ff',
      image,
      ts: Date.now(),
    };
    const r = getRoom(room);
    r.history.push(msg);
    if (r.history.length > MAX_HISTORY) r.history.shift();
    broadcast(room, 'msg', msg);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
  } else if (req.method === 'GET' && url.pathname === '/events') {
    handleEvents(req, res, url);
  } else if (req.method === 'POST' && url.pathname === '/send') {
    handleSend(req, res);
  } else {
    res.writeHead(404);
    res.end('non trovato');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
  console.log('');
  console.log('  ✏️  PictoChat locale avviato!');
  console.log('');
  console.log('  Gli altri si collegano dal browser a uno di questi indirizzi:');
  if (ips.length === 0) {
    console.log('    (nessuna rete trovata: attiva hotspot/Wi-Fi e riavvia)');
  }
  for (const ip of ips) console.log(`    http://${ip}:${PORT}`);
  console.log('');
  console.log(`  Su questo dispositivo: http://localhost:${PORT}`);
  console.log('');
});
