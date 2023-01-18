import net from 'net';
import delay from 'delay';

const SERVER_PORT = 18018;
const SERVER_HOST = '0.0.0.0';

const client = new net.Socket();
client.connect(SERVER_PORT, SERVER_HOST, async () => {
    console.log('Connected to server');
    await delay(3000);
    client.write("Hello, server!\n Love,");
    await delay(3000);
    client.write(" Client.\n");
});
client.on('data', (data) => {
    console.log(`Server sent: ${data}`);
})
client.on('close', () => {
    console.log(`Server disconnected`);
});
client.on('error', (error) => {
    console.log(`Server error: ${error}`);
});