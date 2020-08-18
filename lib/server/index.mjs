import net from 'net';
import JsonSocket from '../utils/JsonSocket';
import genId from '../utils/genId';
import cluster from 'cluster';
import clusterMaster from '../cluster/master';
import clusterWorker from '../cluster/worker';

const server = (settings) => {
  const { port } = settings;
  const serverId = genId();
  const clients = {};
  const workQueue = [];

  const pullLines = (hunger) => {
    Object.entries(clients).forEach(([id, client]) => {
      if (client.doneSending) {
        return;
      }

      client.socket.write({ message: 'SEND_LINES', serverId, hunger });
    });
  };

  const socketHandler = (clientSocket) => {
    clientSocket = new JsonSocket(clientSocket);

    let clientId;

    clientSocket.on('error', (err) => {
      throw new Error(err);
    });

    clientSocket.on('data', (data) => {
      clientId = data.clientId;
      const { message } = data;

      if (message === 'CLIENT_CONNECT') {
        console.log(`Client ${clientId} connected.`);
        clients[clientId] = { socket: clientSocket, doneSending: false };
      }

      if (message === 'DELIVERING_LINES') {
        const { lines, range } = data;
        console.log(`Client ${clientId} is delivering ${lines.length} lines.`);
        workQueue.push({ clientId, lines, range });
        console.log(`WorkQueue contains ${workQueue.length} jobs.`);
      }

      if (message === 'DONE_SENDING') {
        console.log(`Client ${clientId} is finished sending all lines.`);
        clients[clientId].doneSending = true;
      }
    });

    clientSocket.on('close', () => {
      console.log(`Client ${clientId} closed.`);
      delete clients[clientId];
    });
  };

  const shutdownClient = (error, lineNumber) => {
    Object.entries(clients).forEach(([id, client]) => {
      client.socket.write({ message: 'SHUTDOWN', serverId, error, lineNumber });
    });
  };

  const sendResults = ({ results, range, clientId }) => {
    console.log('sendResults', results, range, clientId);

    clients[clientId].socket.write({
      message: 'RESULTS',
      range,
      results,
    });
  };

  return {
    start: () => {
      if (cluster.isMaster) {
        const server = new net.Server(socketHandler).listen(port);

        const shutdownServer = (error) => {
          shutdownClient(error);
          server.close();
        };

        clusterMaster(
          settings,
          pullLines,
          workQueue,
          shutdownServer,
          sendResults,
        );
      }

      if (cluster.isWorker) {
        clusterWorker(settings);
      }
    },
  };
};

export default server;
