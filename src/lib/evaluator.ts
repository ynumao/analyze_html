import { getBrowser } from './puppeteer';

export interface EvaluationData {
    title: string;
    description: string;
    hTags: { level: string; text: string }[];
    images: { alt: string; src: string }[];
    links: { text: string; href: string }[];
    mobileFriendly: boolean;
    ssl: boolean;
    performance: {
        lcp: number | null;
        cls: number | null;
    };
    screenshot: string; // base64
    htmlSnippet: string;
}

export async function scrapeUrl(url: string): Promise<EvaluationData> {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport to desktop first
    await page.setViewport({ width: 1280, height: 800 });

    try {
        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        const ssl = url.startsWith('https://');

        // Basic SEO and DOM info
        const data = await page.evaluate(() => {
            const getHTags = () => {
                const tags: { level: string; text: string }[] = [];
                for (let i = 1; i <= 6; i++) {
                    document.querySelectorAll(`h${i}`).forEach(h => {
                        tags.push({ level: `h${i}`, text: h.textContent?.trim() || '' });
                    });
                }
                return tags;
            };

            const getImages = () => {
                return Array.from(document.querySelectorAll('img')).map(img => ({
                    alt: img.alt || '',
                    src: img.src || '',
                }));
            };

            const getLinks = () => {
                return Array.from(document.querySelectorAll('a')).map(a => ({
                    text: a.textContent?.trim() || '',
                    href: a.href || '',
                }));
            };

            return {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                hTags: getHTags(),
                images: getImages(),
                links: getLinks(),
                // Simple mobile check: check for viewport meta tag
                mobileFriendly: !!document.querySelector('meta[name="viewport"]'),
            };
        });

        // Capture screenshot (base64)
        const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false }) as string;

        // Get a snippet of the HTML (main content)
        const htmlSnippet = await page.evaluate(() => {
            const body = document.querySelector('body')?.innerText.substring(0, 5000) || '';
            return body;
        });

        // Performance (very basic)
        const metrics = await page.metrics();

        await browser.close();

        return {
            ...data,
            ssl,
            performance: {
                lcp: null, // Puppeteer doesn't easily give CWV without more complex setup, but maybe enough for now
                cls: null,
            },
            screenshot,
            htmlSnippet,
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}
