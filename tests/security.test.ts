import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccessGuard } from '../server/access.ts';

const env = { APP_USERNAME:'test-owner', APP_PASSWORD:'synthetic-application-password-not-real-0000', APP_ORIGIN:'http://localhost:5173' };
const authorization='Basic '+Buffer.from(env.APP_USERNAME+':'+env.APP_PASSWORD).toString('base64');
const headers={authorization,origin:env.APP_ORIGIN,'content-type':'application/json'};
function response() {return {code:200,body:undefined as unknown,setHeader(){},status(code:number){this.code=code;return this;},json(body:unknown){this.body=body;}};}

test('access fails closed without operator configuration',()=>{
 const res=response();assert.equal(createAccessGuard({env:{}})({method:'POST',headers},res),false);assert.equal(res.code,503);
});
test('missing or wrong credentials cannot pass the guard',()=>{
 for(const authorization of [undefined,'Basic wrong']) {const res=response();assert.equal(createAccessGuard({env})({method:'POST',headers:{...headers,authorization}},res),false);assert.equal(res.code,401);}
});
test('configured credentials admit same-origin JSON requests',()=>{
 const res=response();assert.equal(createAccessGuard({env})({method:'POST',headers},res),true);assert.equal(res.code,200);
});
test('cross-origin and simple form requests are rejected',()=>{
 for(const change of [{origin:'https://attacker.example'},{'sec-fetch-site':'cross-site'},{'content-type':'text/plain'}]) {const res=response();assert.equal(createAccessGuard({env})({method:'POST',headers:{...headers,...change}},res),false);assert.ok([403,415].includes(res.code));}
});
test('provider request admission is bounded and expires',()=>{
 let now=0;const guard=createAccessGuard({env,now:()=>now});
 for(let i=0;i<10;i++)assert.equal(guard({method:'POST',headers},response()),true);
 const res=response();assert.equal(guard({method:'POST',headers},res),false);assert.equal(res.code,429);
 now=60001;assert.equal(guard({method:'POST',headers},response()),true);
});
test('all serverless handlers fail closed before any outbound request',async()=>{
 process.env.APP_USERNAME='';process.env.APP_PASSWORD='';process.env.APP_ORIGIN='';process.env.OPENAI_API_KEY='';process.env.GITHUB_TOKEN='';
 const fetchBefore=globalThis.fetch;globalThis.fetch=async()=>{assert.fail('No network request is allowed');};
 try {
  for(const file of ['../api/blueprint.ts','../api/submission-kit.ts','../api/github/repo.ts','../api/health.ts']){
   const handler=(await import(file)).default;const res=response();await handler({method:'POST',headers,body:{}},res);assert.equal(res.code,503,file);
  }
 }finally{globalThis.fetch=fetchBefore;}
});
test('repository input cannot change the fixed API path structure',async()=>{
 const {getRepoPulse}=await import('../server/core.ts');
 const before=globalThis.fetch;globalThis.fetch=async()=>{assert.fail('Malformed input must not call GitHub');};
 try{for(const url of ['a/../user','https://attacker.example/a/b','owner/repo?token=x','owner/%2fuser','https://github.com/a/b?x=1'])await assert.rejects(getRepoPulse(url));}finally{globalThis.fetch=before;}
});
test('private repository data is never displayed or expanded',async()=>{
 const {getRepoPulse}=await import('../server/core.ts');let calls=0;
 const before=globalThis.fetch;globalThis.fetch=async()=>{calls++;return Response.json({private:true});};
 try{await assert.rejects(getRepoPulse('owner/private-repo'),/public repositories/);assert.equal(calls,1);}finally{globalThis.fetch=before;}
});
