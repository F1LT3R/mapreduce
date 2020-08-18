import crypto from 'crypto';

const genId = () => crypto.randomBytes(4).toString('hex');

export default genId;
