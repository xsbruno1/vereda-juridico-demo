// No package installation or network required. Run: node tests/run.cjs
const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const name of ['professional.test.cjs','commerce.test.cjs','property.test.cjs','operations.test.cjs','operations-ui.test.cjs']){
  const result=spawnSync(process.execPath,[path.join(__dirname,name)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
console.log('All Vereda evolution checks passed. Browser, deployment and production service checks are separate.');
