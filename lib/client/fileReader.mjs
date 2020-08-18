import fs from 'fs';
import readline from 'readline';
import { log } from '../utils/log';

const fileReader = (fileQueue, lines, done) => {
  const fileCount = fileQueue.length;

  const readNextFile = () => {
    let lineNumber = 0;
    const filename = fileQueue.shift();

    const readsDone = (fileCount) => {
      log(`Done reading all ${fileCount} file(s).`);
      done();
    };

    const fileReader = readline.createInterface({
      input: fs.createReadStream(filename),
    });

    fileReader.on('error', (err) => {
      throw new Error(err);
    });

    fileReader.on('line', (text) => {
      const sent = false;
      const result = null;

      lines.push({ filename, lineNumber, text, sent, result });
      lineNumber += 1;
    });

    fileReader.on('close', () => {
      log(`Done reading ${lineNumber + 1} lines from ${filename}.`);

      if (!fileQueue.length) {
        return readsDone(fileCount);
      }

      readNextFile(fileQueue, lines);
    });
  };

  return { readNextFile };
};

export default fileReader;
