import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel / Production environment (Amazon Linux 2023 compatibility)
    // IMPORTANT: setGraphicsMode = false is critical for AL2023 to avoid libnss3 dependency
    
    // @ts-ignore - setGraphicsMode might not be in the typings but is available at runtime
    if (typeof chromium.setGraphicsMode === 'function') {
        chromium.setGraphicsMode(false);
    } else {
        chromium.setGraphicsMode = false;
    }

    return await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ],
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
