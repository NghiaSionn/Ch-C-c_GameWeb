import {metrics} from './metrics.js';
import {DatabaseSync} from 'node:sqlite';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';

export function openStore(dir){
 const sql=new DatabaseSync(path.join(dir,'market.sqlite'));
 sql.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS profiles(token TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, data TEXT NOT NULL);');
 const readProfiles=sql.prepare('SELECT token,data FROM profiles'),readSettings=sql.prepare('SELECT key,data FROM settings');
 let db={profiles:{}};const old=path.join(dir,'market.json');
 const rows=readProfiles.all();if(rows.length){for(const r of rows)db.profiles[r.token]=JSON.parse(r.data);for(const r of readSettings.all())db[r.key]=JSON.parse(r.data)}else if(existsSync(old)){db=JSON.parse(readFileSync(old,'utf8'))}
 const put=sql.prepare('INSERT INTO profiles(token,data) VALUES(?,?) ON CONFLICT(token) DO UPDATE SET data=excluded.data'),del=sql.prepare('DELETE FROM profiles WHERE token=?'),setting=sql.prepare('INSERT INTO settings(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data');
 const previous=new Map(rows.map(r=>[r.token,r.data]));const previousSettings=new Map();
 function save(value){const measureStart=performance.now();sql.exec('BEGIN IMMEDIATE');try{for(const token of previous.keys())if(!Object.hasOwn(value.profiles,token))del.run(token);for(const [token,p] of Object.entries(value.profiles)){const json=JSON.stringify(p);if(previous.get(token)!==json)put.run(token,json)}for(const [key,v] of Object.entries(value))if(key!=='profiles'){const json=JSON.stringify(v);if(previousSettings.get(key)!==json)setting.run(key,json)}sql.exec('COMMIT');previous.clear();for(const [t,p] of Object.entries(value.profiles))previous.set(t,JSON.stringify(p));for(const [k,v] of Object.entries(value))if(k!=='profiles')previousSettings.set(k,JSON.stringify(v))}catch(e){sql.exec('ROLLBACK');throw e}finally{metrics.saves++;metrics.saveLastMs=performance.now()-measureStart;metrics.saveMaxMs=Math.max(metrics.saveMaxMs,metrics.saveLastMs)}}
 save(db);return {db,save,close:()=>sql.close()};
}

