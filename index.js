const { prompt } = require('enquirer');

const swarm = require('discovery-swarm');

const sw = swarm({ dht: false })
const port = Math.round(Math.random() * 9000) + 999;

const main = async () => {

    try {

        const response = await prompt({
            type: 'input',
            name: 'channel',
            message: 'Which channel:'
        });

        console.log({ port });
        sw.listen(port)
        console.log('Joined channel', response.channel)
        sw.join(response.channel) // can be any id/name/hash

        const connections = new Map();

        const handleIncoming = (id, data) => {
            console.log(id, data);
        }

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
    } catch (error) {
        console.error(error);
        process.exit();
    }
}
main();