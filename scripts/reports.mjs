import {DatabaseSync} from 'node:sqlite';import path from 'node:path';
const db=new DatabaseSync(path.join(process.env.DATA_DIR||'data','market.sqlite'),{readOnly:true});
const row=db.prepare("SELECT data FROM settings WHERE key='reports'").get();
console.log(JSON.stringify(row?JSON.parse(row.data):[],null,2));db.close();
