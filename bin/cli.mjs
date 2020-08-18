#!/usr/bin/env node --es-module-specifier-resolution=node --no-warnings
import args from '../lib/utils/args';

const settings = args(process.argv);
const { isServer, isClient } = settings;

if (isServer && isClient) {
  throw new Error('Use --server or --client. Not both.');
}

const start = (modPath, settings) =>
  import(modPath)
    .then((module) => module.default(settings).start())
    .catch((err) => console.error(err));

isServer && start('../lib/server', settings);
isClient && start('../lib/client', settings);
