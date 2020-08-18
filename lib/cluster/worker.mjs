import { ok, log, warn } from '../utils/log';
import { blue } from '../utils/color';

const pid = process.pid;

const worker = (settings) => {
  setInterval(() => {
    process.send({ message: 'HUNGRY', hunger: 100, pid });
  }, 100);

  const work = ({ lines, range, clientId }) => {
    const results = lines
      .map((line) => line.split(/[\s,]+/))
      .map((line) =>
        line.map((value) => {
          const number = Number(value);
          if (Number.isNaN(number)) {
            process.send({
              message: 'ERROR_NAN',
              reason: `"${value}" is not a number!`,
              pid,
              clientId,
            });
            process.exit(1);
            return value;
          }
          return number;
        }),
      )
      .map((line) =>
        line.reduce((accumulator, currentValue) => accumulator + currentValue),
      );

    process.send({ message: 'RESULTS', results, range, clientId });
    process.send({ message: 'HUNGRY', hunger: 100, pid });
  };

  process.on('message', (data) => {
    const { message } = data;

    if (message === 'INCOMING_TASK') {
      const { job } = data;
      work(job);
    }

    if (message === 'SHUTDOWN') {
      process.exit(0);
    }
  });
};

export default worker;
