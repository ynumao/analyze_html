import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel / Production environment (Amazon Linux 2023 compatibility)
    // Using chromium-min and disabling graphics to avoid libnss3 dependency issues
    
    return await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
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
