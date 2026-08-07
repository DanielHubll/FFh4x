const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let robloxClient = null;  // conexão do Roblox
let siteClient = null;    // conexão do site

wss.on('connection', (ws, req) => {
    const clientType = new URL(req.url, 'http://localhost').searchParams.get('type');

    if (clientType === 'roblox') {
        robloxClient = ws;
        console.log('✅ Roblox conectado!');
        ws.on('close', () => { robloxClient = null; console.log('❌ Roblox desconectado'); });

    } else if (clientType === 'site') {
        siteClient = ws;
        console.log('✅ Site conectado!');
        ws.on('close', () => { siteClient = null; console.log('❌ Site desconectado'); });

    } else {
        ws.close();
        return;
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        console.log('📩 Recebido:', data);

        // Encaminha do site → Roblox
        if (clientType === 'site' && robloxClient && robloxClient.readyState === WebSocket.OPEN) {
            robloxClient.send(JSON.stringify(data));
        }

        // Encaminha do Roblox → site (para status/confirmação)
        if (clientType === 'roblox' && siteClient && siteClient.readyState === WebSocket.OPEN) {
            siteClient.send(JSON.stringify(data));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
