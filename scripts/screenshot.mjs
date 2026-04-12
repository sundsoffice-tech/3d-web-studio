import puppeteer from 'puppeteer';

const URL = process.argv[2] || 'http://localhost:5176';
const OUT = process.argv[3] || 'debug-screenshot.png';
const WAIT = parseInt(process.argv[4] || '3000');

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
await new Promise(r => setTimeout(r, WAIT));
await page.screenshot({ path: OUT, fullPage: false });
console.log('Screenshot saved:', OUT);
await browser.close();
