import * as cheerio from 'cheerio';

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
    const browserlessApiKey = process.env.BROWSERLESS_API_KEY || '2Tl89xqM7NGDdv5b07e8c6f1fe310c20b95b8c1d01ca59a21';
    
    try {
        // Use Browserless.io API for screenshot
        const screenshotResponse = await fetch(`https://chrome.browserless.io/screenshot?token=${browserlessApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                options: {
                    fullPage: false,
                    type: 'png'
                }
            })
        });

        if (!screenshotResponse.ok) {
            throw new Error(`Browserless screenshot API error: ${screenshotResponse.statusText}`);
        }

        const screenshotBuffer = await screenshotResponse.arrayBuffer();
        const screenshot = Buffer.from(screenshotBuffer).toString('base64');

        // Use Browserless.io API for content scraping
        const contentResponse = await fetch(`https://chrome.browserless.io/content?token=${browserlessApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url
            })
        });

        if (!contentResponse.ok) {
            throw new Error(`Browserless content API error: ${contentResponse.statusText}`);
        }

        const htmlContent = await contentResponse.text();
        
        // Parse HTML with Cheerio
        const $ = cheerio.load(htmlContent);

        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';
        
        // Extract H tags
        const hTags: { level: number; text: string }[] = [];
        for (let i = 1; i <= 6; i++) {
            $(`h${i}`).each((_, el) => {
                hTags.push({ level: i, text: $(el).text().trim() });
            });
        }

        const ssl = url.startsWith('https://');
        const mobileFriendly = $('meta[name="viewport"]').length > 0;
        const htmlSnippet = $('body').text().substring(0, 1000);

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
        throw error;
    }
}
