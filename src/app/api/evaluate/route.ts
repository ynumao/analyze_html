import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/evaluator';
import { analyzeWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { url, apiKey } = await req.json();
        const trimmedApiKey = apiKey?.trim();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const finalApiKey = trimmedApiKey || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({ error: 'Gemini API Key is not configured. Please provide it in the input field or set GEMINI_API_KEY environment variable.' }, { status: 400 });
        }

        // Step 1: Scrape the site
        const data = await scrapeUrl(url);

        // Step 2: Analyze with Gemini
        const evaluation = await analyzeWithAI(data, finalApiKey);

        return NextResponse.json({
            evaluation,
            screenshot: data.screenshot, // Return screenshot to display
        });

    } catch (error: any) {
        console.error('Evaluation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
