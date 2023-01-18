import net from 'net';
import delay from 'delay';
import { canonicalize } from 'json-canonicalize';

const PORT = 18018;
const HOST = '0.0.0.0';
const INVALID_FORMAT = 'INVALID_FORMAT';
const INVALID_HANDSHAKE = 'INVALID_HANDSHAKE';
const bootstrapPeers = ["45.63.84.226:18018", "45.63.89.228:18018", "144.202.122.8:18018"];
let discoveredPeers = new Set(bootstrapPeers);

function handleError (error_name: string, msg: string) {
    return (JSON.stringify({
        type: "error",
        data: { name: error_name, nmessage: msg },
      }) + "\n")
}

const server = net.createServer((socket) => {
    const address = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`A new peer has connected: ${address}`);
    
    let connectedPeers = new Set([...discoveredPeers]);
    let pastPeers = new Map<string, Set<string>>();
    connectedPeers.add(address);
    // Send "hello" message on connection
    socket.write(JSON.stringify({ type: 'hello', data: { version: '0.9.0', agent: 'Marabu-Core Client 0.9' } }) + '\n');
    // Send get peers 
    socket.write(JSON.stringify({ type: "getpeers" }) + '\n');
    
    let isHandshakeComplete = false;
    let buffer = '';
    socket.on('data', (data) => {
        // Handle incoming data - processes data using \n as a delimiter
        buffer += data;
        const messages = buffer.split('\n');
        if (messages.length > 1) {
            for (const message of messages.slice(0,-1)) {
                console.log(`Client ${address} sent: ${message}`)
            }
            buffer = messages[messages.length - 1]
        }
        try {
            // Logic that handles the requests
            const parsedData = JSON.parse(canonicalize(buffer));
            if (parsedData.type != "hello" && !isHandshakeComplete) {
                socket.write(handleError(INVALID_HANDSHAKE, "Needs to complete handshake before transferring messages"));
                socket.end();
            }    
            // Handle valid messages
            switch (parsedData.type) {
                case "hello": 
                    if(isHandshakeComplete) {
                        socket.write(handleError(INVALID_FORMAT, "Already completed handshake."));
                        socket.end();
                    }
                    else {
                        if(/^0\.9\.[0-9]+$/.test(parsedData.version)) {
                            isHandshakeComplete = true;
                            console.log(`Peer ${parsedData.data.name} has completed handshake.`);
                        } else {
                            socket.write(handleError(INVALID_FORMAT, "version is not in the correct format"));
                            socket.end();
                        }
                    }
                case "getpeers":
                    let peers = Array.from(connectedPeers);
                    if (pastPeers.has(`${socket.remoteAddress}:${socket.remotePort}`)) {
                        // add the previously sent peers to the list
                        let prevPeers = pastPeers.get(`${socket.remoteAddress}:${socket.remotePort}.`)
                        if (prevPeers != undefined) {
                            peers = [...peers, ...prevPeers];
                        }
                        }    
                    const response = {
                        type: "peers",
                        peers: peers,
                    };
                    socket.write(JSON.stringify(response) + "\n");
                    break;
                case "peers":
                    pastPeers.set(
                        `${socket.remoteAddress}:${socket.remotePort}`,
                        new Set(parsedData.peers)
                        );
                    break;
                default:
                    return handleError(INVALID_FORMAT, "Invalid type object");
            }
          } catch (err) {
            console.log(`Error: ${err}`)
          }
    });
    socket.on('error', (error) => {
        console.log(`Client ${address} error: ${error}`);
    });
    socket.on('close', () => {
        pastPeers.delete(`${socket.remoteAddress}:${socket.remotePort}`);
        console.log(`Client: ${address} disconnected`);
    });

    
});
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  const client = new net.Socket();

  // try to connect to one of the discovered peers
  for (const peer of discoveredPeers) {
    const [host, port] = peer.split(":");
    client.connect(+port, host, () => {
      console.log("Connected to peer: " + peer);
    });
    break;
  }