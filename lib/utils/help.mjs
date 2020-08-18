import { red, green, yellow } from './color';
import pkg from '../../package';

const help = () => {
  const name = pkg.name.split('/').pop();
  const desc = pkg.description;

  const HEADING = {
    NAME: red('NAME'),
    SYNOPSIS: red('SYNOPSIS'),
    EXAMPLES: red('EXAMPLES'),
  };

  const prog = {
    name: red(name),
    desc: yellow(desc),
  };

  const num = green('num');
  const address = green('address');

  const flags = {
    server: red('--server'),
    client: red('--client'),
    port: red('--port'),
    host: red('--host'),
    files: green('file(s) ...'),
    workers: green('worker(s)'),
  };

  console.log(`
${HEADING.NAME}
    ${prog.name} -- ${prog.desc}

${HEADING.SYNOPSIS}
    Server Usage: ${prog.name} [${flags.port} ${num}] [${flags.host} ${address}] ${flags.server} [${flags.workers} ${num}]
    Client Usage: ${prog.name} [${flags.port} ${num}] [${flags.host} ${address}] ${flags.client} [${flags.files}] 

${HEADING.EXAMPLES}
    ${name} --port 8081 --server 5
    ${name} --port 8081 --client array.txt array2.txt
`);
};

export default help;
