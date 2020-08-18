import JsonSocket from '../utils/JsonSocket';
import genId from '../utils/genId';
import fileReader from './fileReader';
import { log, error } from '../utils/log';

const client = (settings) => {
  const { host, port, files } = settings;
  const clientId = genId();

  const lines = [];
  let linesSent = 0;
  let resultsReceived = 0;
  let allLinesSent = false;
  let allFilesRead = false;

  const shouldTally = () =>
    allFilesRead && allLinesSent && resultsReceived === lines.length;

  const connectSocket = () => {
    const socket = new JsonSocket();

    const tallyResults = () => {
      process.stdout.write('\n');

      files.forEach((filename) => {
        console.log(`\n${filename}`);

        const fileLines = lines.filter((line) => line.filename === filename);
        let total = 0;

        fileLines.forEach(({ result }, i) => {
          console.log(`Array ${i + 1}: ${result}`);
          total += result;
        });

        console.log(`Total: ${total}`);
      });

      setTimeout(() => socket.end(), 400);
    };

    socket.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        error('ECONNREFUSED! Did you start the server?');
        return;
      }

      throw new Error(err);
    });

    socket.on('connect', (data) => {
      socket.write({ message: 'CLIENT_CONNECT', clientId });
      fileReader([...files], lines, () => (allFilesRead = true)).readNextFile();
    });

    socket.on('data', (data) => {
      const { message, serverId } = data;

      if (message === 'SHUTDOWN') {
        const { error, lineNumber } = data;
        console.error(error);
        process.exit(1);
      }

      if (message === 'SEND_LINES') {
        const { hunger } = data;
        console.log(`Server ${serverId} requested ${hunger} lines.`);

        if (linesSent >= lines.length && allFilesRead) {
          console.log(`Done sending all ${lines.length} lines to server.`);
          allLinesSent = true;
          socket.write({ message: 'DONE_SENDING', clientId });

          shouldTally() && tallyResults();
          return;
        }

        const hungerBounds = linesSent + data.hunger;
        const end =
          hungerBounds > lines.length ? lines.length - 1 : hungerBounds;
        const range = { start: linesSent, end };
        const sendLines = lines
          .slice(range.start, range.end + 1)
          .map(({ text }) => text);

        linesSent = range.end + 1;

        console.log({ range, sendLines });

        socket.write({
          message: 'DELIVERING_LINES',
          clientId,
          lines: sendLines,
          range,
        });
      }

      if (message === 'RESULTS') {
        const { results, range } = data;
        console.log('RESULTS!', { results, range });

        for (let i = range.start; i <= range.end; i += 1) {
          lines[i].result = results[i - range.start];
        }

        resultsReceived += range.end - range.start + 1;

        shouldTally() && tallyResults();
      }
    });

    socket.connect({ host, port });

    return socket;
  };

  return {
    start: () => {
      log('Starting client...');
      connectSocket();
      log('Client started.');
    },
  };
};

export default client;
