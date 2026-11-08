// Browser smoke test with MOCKED Supabase responses. No live account or writes.
// Run: npm install --no-save --package-lock=false @playwright/test
// Start Vite, then: node tests/admin-smoke.mjs
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {SERVICES,BARBERS,GALLERY} from '../src/data.js';
const now=new Date().toISOString();
const rows=[...SERVICES.map((data,i)=>({collection:'services',id:data.id,data,sort_order:i,updated_at:now})),...BARBERS.slice(1).map((data,i)=>({collection:'staff',id:data.id,data,sort_order:i,updated_at:now})),...GALLERY.map((data,i)=>({collection:'gallery',id:`g${i}`,data,sort_order:i,updated_at:now}))];
const campaigns=[];const errors=[];
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/nhvokxemyaymmqruzpcp.supabase.co/**',async route=>{
 const req=route.request(),url=new URL(req.url());let data={};
 if(url.pathname.includes('/auth/v1/token')){
  const exp=Math.floor(Date.now()/1000)+3600;const token=[{alg:'HS256',typ:'JWT'},{sub:'smoke-test-user',exp},'signature'].map((v,i)=>i===2?v:Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
  data={access_token:token,refresh_token:'test-refresh',expires_in:3600,expires_at:exp,token_type:'bearer',user:{id:'smoke-test-user',email:'admin@example.test',aud:'authenticated',role:'authenticated'}};
 }else if(url.pathname.includes('/rpc/is_site_admin'))data=true;
 else if(url.pathname.endsWith('/site_content')){const collection=url.searchParams.get('collection')?.replace('eq.','');data=collection?rows.filter(r=>r.collection===collection):rows;}
 else if(url.pathname.endsWith('/ad_campaigns')){if(req.method()==='POST'){campaigns.push(JSON.parse(req.postData()));data=null;}else data=campaigns;}
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
});
await page.goto('http://127.0.0.1:5173');
await page.locator('#adminOpen').click();
await page.getByPlaceholder('Admin email').fill('admin@example.test');await page.getByPlaceholder('Password',{exact:true}).fill('test-password');
await page.getByRole('button',{name:'Unlock the lounge'}).click();
await page.getByRole('heading',{name:'A fresh start, every day.'}).waitFor();
await page.screenshot({path:`${process.env.ADMIN_SCREENSHOT_DIR||'/tmp'}/admin-dashboard.png`});
await page.getByRole('button',{name:'Services & prices',exact:true}).click();
await page.getByRole('searchbox',{name:'Search records'}).fill('Beard Trim');
assert.equal(await page.locator('.admin-row:visible').count(),1);
await page.getByRole('button',{name:'Duplicate',exact:true}).click();
await page.getByLabel('Name',{exact:true}).fill('Unsaved test');
let warned=false;page.once('dialog',async d=>{warned=true;await d.dismiss();});await page.getByRole('button',{name:'Back',exact:true}).click();assert(warned);
page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Back',exact:true}).click();
await page.getByRole('button',{name:'Google Ads',exact:false}).click();await page.getByRole('button',{name:'+ Plan campaign',exact:true}).click();
await page.getByLabel('Campaign name',{exact:true}).fill('Weekend fresh cuts');await page.getByLabel('Total planned budget (KSh)',{exact:true}).fill('5000');
await page.getByLabel('Actual spend to date (KSh)',{exact:true}).fill('1000');await page.getByLabel('Recorded clicks',{exact:true}).fill('50');
await page.getByRole('button',{name:'Save campaign',exact:true}).click();await page.getByRole('heading',{name:'Weekend fresh cuts',exact:true}).waitFor();assert.equal(campaigns.length,1);
await page.screenshot({path:`${process.env.ADMIN_SCREENSHOT_DIR||'/tmp'}/admin-google-ads.png`});
await page.setViewportSize({width:390,height:844});
assert(await page.locator('.admin-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
await page.screenshot({path:`${process.env.ADMIN_SCREENSHOT_DIR||'/tmp'}/admin-mobile.png`});
assert.deepEqual(errors,[]);console.log('PASS: mock login, dashboard, search, duplicate, unsaved warning, campaign save, mobile fit; no browser errors.');await browser.close();
