const server = process.env.DNS || 'ec2-54-93-34-212.eu-central-1.compute.amazonaws.com:5300'
const swarm = require('discovery-swarm');
const blessed = require('blessed');

const log = (...text) => {
    body.pushLine(text.join(' '));
    screen.render();
}

const screen = blessed.screen();
const body = blessed.box({
    top: 0,
    left: 0,
    height: '100%-1',
    width: '100%',
    keys: true,
    mouse: true,
    alwaysScroll: true,
    scrollable: true,
    scrollbar: {
        ch: ' ',
        bg: 'red'
    }
});
const inputBar = blessed.textbox({
    bottom: 0,
    left: 0,
    height: 1,
    width: '100%',
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: {
        fg: 'white',
        bg: 'blue'	// Blue background so you see this is different from body
    }
});

screen.append(body);
screen.append(inputBar);
inputBar.focus();

screen.key(['escape', 'q', 'C-c'], (ch, key) => (process.exit(0)));



log('Using DNS Server: ', server)
const sw = swarm({
    dht: false, dns: { server }
})
const port = Math.round(Math.random() * 100) + 6666;
log("Running on port " + port)
sw.listen(port)
sw.join('tixl') // can be any id/name/hash
log('Joined channel "tixl"');

const connections = new Map();

const handleIncoming = (id, data) => {
    log(id.slice(0, 8), data);
}

sw.on('peer', peer => {
    log('found peer', peer.host, peer.port)
})

sw.on('connection', function (connection, info) {
    const id = info.id.toString('hex');
    connections.set(id, connection);
    log('Added connection with id', id.slice(0, 8))
    connection.on('data', chunk => handleIncoming(id, JSON.parse(chunk.toString())))
})

sw.on('connection-closed', (connection, info) => {
    if (!info || !info.id) return;
    const id = info.id.toString('hex');
    log('Removed connection with id', id.slice(0, 8))
    connection;
})
inputBar.on('submit', (text) => {
    log('Sent:', text);
    for (const con of connections.values()) {
        con.write(Buffer.from(JSON.stringify({ message: text })))
    }
    inputBar.clearValue();
    screen.render();
    inputBar.focus();
});

