import net from 'net';
import delay from 'delay';

const SERVER_PORT = 18018;
const SERVER_HOST = '0.0.0.0';

const client = new net.Socket();
client.connect(SERVER_PORT, SERVER_HOST, async () => {
    client.write(JSON.stringify({ type: 'hello', data: { version: '0.9.0', agent: 'Marabu-Core Client 0.9' } }) + '\n');
    await delay(3000);
    client.write(JSON.stringify({ type: 'getpeers'}) + '\n');
    await delay(3000);
    client.write(JSON.stringify({ type: 'incorrect code'}) + '\n');
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