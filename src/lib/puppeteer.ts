import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel / Production environment (Amazon Linux 2023)
    // Using full @sparticuz/chromium for complete library shims
    
    return await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
      ],
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
