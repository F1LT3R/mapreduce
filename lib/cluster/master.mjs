import cluster from 'cluster';
import { ok, warn, log } from '../utils/log';
import { blue } from '../utils/color';

const master = (
  settings,
  requestLines,
  workQueue,
  shutdownServer,
  sendResults,
) => {
  const { workerCount } = settings;

  const activeWorkers = [];

  let shuttingDown = false;

  const shutdownWorkers = () => {
    console.log('Master is shutting down workers...');
    shuttingDown = true;
    activeWorkers.forEach((worker) => {
      worker.send({ message: 'SHUTDOWN' });
    });
  };

  const forkWorker = () => {
    if (activeWorkers.length >= workerCount) {
      ok(`Cluster Master > Spawned ${workerCount} Workers.`);
      return;
    }

    const worker = cluster.fork();

    worker.on('message', (data) => {
      const { message } = data;
      // console.log(data);

      if (message === 'RESULTS') {
        const { results, range, clientId } = data;
        console.log({ results, range });
        sendResults({ results, range, clientId });
      }

      if (message === 'ERROR_NAN') {
        const { pid, reason } = data;
        const errorMessage = `Worker Error on PID ${pid}! ${reason}`;
        console.error(errorMessage);
        shutdownWorkers();
        shutdownServer(errorMessage);
      }

      if (message === 'HUNGRY') {
        if (workQueue.length > 0) {
          worker.send({
            message: 'INCOMING_TASK',
            job: workQueue.shift(),
          });
        } else {
          requestLines(data.hunger);
        }
      }
    });

    activeWorkers.push(worker);

    forkWorker();
  };

  cluster.on('online', (worker) => {
    ok(`Cluster Master > Worker online (pid ${worker.process.pid}).`);
  });

  cluster.on('exit', function(worker, code, signal) {
    ok(`Cluster Master > saw Worker exit (pid ${worker.process.pid}).`);

    log(`> Worker (pid ${worker.process.pid}) died with code ${code}.`);

    if (!shuttingDown) {
      log('Cluster Master > Spawning a new worker...');
      forkWorker();
    }
  });

  forkWorker();

  ok(`Cluster Master > Running w/ pid ${process.pid}`);
};

export default master;
