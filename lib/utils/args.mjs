import help from './help';
import sharedConfig from '../../config/shared';
import serverConfig from '../../config/server';
import clientConfig from '../../config/client';

const setting = (name, options, config) => {
  const flag = `--${name}`;
  const flagPassed = options.includes(flag);
  const value = flagPassed ? options[options.indexOf(flag) + 1] : config[name];
  return {
    [name]: value,
  };
};

const files = (options) => ({
  files: options.slice(options.lastIndexOf('--client') + 1),
});

const workers = (options, config) => ({
  workers:
    options.slice(options.lastIndexOf('--server') + 1)[0] || config.workers,
});

const args = (argv) => {
  const options = argv.slice(2);

  (options.length === 0 ||
    options.includes('-h') ||
    options.includes('--help')) &&
    help();

  const isServer = options.includes('--server');
  const isClient = options.includes('--client');

  const config = {
    ...sharedConfig,
    ...(isServer && serverConfig),
    ...(isClient && clientConfig),
  };

  const settings = Object.assign({
    isServer,
    isClient,
    ...config,
    ...setting('port', options, config),
    ...setting('host', options, config),
    ...(isClient && files(options)),
    ...(isServer && workers(options, serverConfig)),
  });

  return settings;
};

export default args;
