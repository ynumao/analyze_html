import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel / Production environment (Amazon Linux 2023)
    // Using @sparticuz/chromium v126 and puppeteer-core v22
    
    // Add additional flags for stability in serverless/AL2023
    const args = [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process'
    ];

    return await puppeteer.launch({
      args: args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development (Mac)
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    return await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: executablePath,
      headless: true,
    });
  }
}
