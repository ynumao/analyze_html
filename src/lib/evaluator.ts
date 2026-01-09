import { getBrowser } from './puppeteer';

export interface EvaluationData {
    title: string;
    description: string;
    hTags: { level: number; text: string }[];
    ssl: boolean;
    mobileFriendly: boolean;
    htmlSnippet: string;
    screenshot: string;
}

export async function scrapeUrl(url: string): Promise<EvaluationData> {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport to desktop first
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        const ssl = url.startsWith('https://');

        // Extract metadata
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content') || '').catch(() => '');

        // Extract H tags
        const hTags = await page.evaluate(() => {
            const tags: { level: number; text: string }[] = [];
            for (let i = 1; i <= 6; i++) {
                const elements = document.querySelectorAll(`h${i}`);
                elements.forEach((el) => {
                    tags.push({ level: i, text: el.textContent?.trim() || '' });
                });
            }
            return tags;
        });

        // Get HTML snippet (first 1000 chars of body text)
        const htmlSnippet = await page.evaluate(() => {
            return document.body.innerText.substring(0, 1000);
        });

        // Check mobile-friendly meta tag
        const mobileFriendly = await page.$('meta[name="viewport"]').then(() => true).catch(() => false);

        // Take screenshot
        const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'png' });
        const screenshot = Buffer.from(screenshotBuffer).toString('base64');

        await browser.close();

        return {
            title,
            description,
            hTags,
            ssl,
            mobileFriendly,
            htmlSnippet,
            screenshot,
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}
