import {backupDatabase} from '../operations.js';
console.log(await backupDatabase(process.env.DATA_DIR||'data'));
