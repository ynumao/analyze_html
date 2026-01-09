import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel / Production environment
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development (Mac)
    // On Mac, we use the local Chrome/Chromium installation
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    return await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: executablePath,
      headless: true,
    });
  }
}
