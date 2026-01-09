import puppeteer from 'puppeteer';

export async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    // For serverless environments like Vercel, though we are on a mac local machine here.
    // However, keeping it general.
    return await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
  } else {
    return await puppeteer.launch({
      headless: true,
    });
  }
}
