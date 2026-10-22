import './prepare-reports.mjs';
import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const previous=process.argv.includes('--failed')?JSON.parse(fs.readFileSync('reports/generated/route-regression-results.json')):[];
const scripts=previous.length?previous.filter(x=>!x.ok).map(x=>x.script):JSON.parse(fs.readFileSync('package.json')).scripts.test.split(' && ').map(s=>s.replace(/^node /,''));const results=previous.filter(x=>x.ok);
for(const script of scripts){const r=spawnSync(process.execPath,[script],{encoding:'utf8',maxBuffer:8e6,timeout:60000});const row={script,ok:r.status===0,output:r.status===0?undefined:(r.stdout+r.stderr).slice(-15000)};results.push(row);console.log(script+': '+(row.ok?'PASS':'FAIL'));}
fs.writeFileSync('reports/generated/route-regression-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,total:results.length}));

if(results.some(r=>!r.ok))process.exitCode=1;
