const { prompt } = require('enquirer');
const server = process.env.DNS || 'ec2-54-93-34-212.eu-central-1.compute.amazonaws.com:5300'
const swarm = require('discovery-swarm');

const sw = swarm({
    dht: false, dns: { server }
})
const port = Math.round(Math.random() * 100) + 6666;
console.log("Running on port " + port)
sw.listen(port)
sw.join('tixl') // can be any id/name/hash
console.log('Joined channel "tixl"');

const connections = new Map();

const handleIncoming = (id, data) => {
    console.log(id, data);
}

sw.on('peer', peer => {
    console.log('found peer ', peer.host, peer.port)
})

sw.on('connection', function (connection, info) {
    const id = info.id.toString('hex');
    connections.set(id, connection);
    console.log('Added connection with id ', id)
    connection.on('data', chunk => handleIncoming(id, JSON.parse(chunk.toString())))
})

sw.on('connection-closed', (connection, info) => {
    if (!info || !info.id) return;
    const id = info.id.toString('hex');
    console.log('Removed connection with id ', id)
    connection;
    connections.delete(id);
})
const input = async () => {
    try {

        const response = await prompt({
            type: 'input',
            name: 'message',
            message: 'Message:'
        });
        for (const con of connections.values()) {
            con.write(Buffer.from(JSON.stringify({ message: response.message })))
        }
        input();
    } catch (error) {
        console.error(error);
        process.exit();
    }

}
input();