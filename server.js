const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

console.log('✅ Server WebSocket berjalan di ws://localhost:8080');

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`🟢 Klien baru terhubung. Total klien: ${clients.size}`);

    // Kirim pesan sambutan ke klien yang baru masuk
    ws.send(JSON.stringify({
        user: 'Server',
        text: 'Selamat datang di Chat Room! 👋',
        time: new Date().toLocaleTimeString('id-ID')
    }));

    // Beritahu klien lain ada yang masuk
    clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                user: 'Server',
                text: 'Pengguna baru bergabung ke chat room.',
                time: new Date().toLocaleTimeString('id-ID')
            }));
        }
    });

    // Saat menerima pesan dari klien
    ws.on('message', (message) => {
        let parsed;
        try {
            parsed = JSON.parse(message.toString());
        } catch {
            parsed = { user: 'Anonim', text: message.toString() };
        }

        parsed.time = new Date().toLocaleTimeString('id-ID');
        console.log(`💬 [${parsed.time}] ${parsed.user}: ${parsed.text}`);

        // Broadcast ke semua klien yang terhubung
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(parsed));
            }
        });
    });

    // Saat klien terputus
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`🔴 Klien terputus. Sisa klien: ${clients.size}`);
    });

    // Tangani error
    ws.on('error', (err) => {
        console.error('❌ Error pada klien:', err.message);
        clients.delete(ws);
    });
});