import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationData } from './evaluator';

export async function analyzeWithAI(data: EvaluationData, apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // List updated to prioritize gemini-2.5-flash as requested
    const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[Diagnostic] Attempting analysis with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            // Note: If using v1 specifically is needed, some SDK versions allow version in the model name or via headers, 
            // but let's stick to valid model names first.

            const prompt = `
あなたはプロのWebマーケターおよびUI/UXデザイナーです。提供されたウェブサイトのデータ（テキスト、構造、スクリーンショット情報）に基づき、以下の5つの評価軸で詳細な評価を行ってください。

評価軸:
1. 技術・パフォーマンス（基本品質）
2. デザイン・UI/UX（使いやすさ）
3. コンテンツ・コピーライティング（説得力）
4. コンバージョン（CRO）要素
5. 法務・信頼性（リスク管理）

入力データ:
- タイトル: ${data.title}
- ディスクリプション: ${data.description}
- Hタグ構造: ${JSON.stringify(data.hTags)}
- SSL: ${data.ssl ? '有効' : '無効'}
- モバイルフレンドリー設定: ${data.mobileFriendly ? 'あり' : 'なし'}
- ページ内容抜粋: ${data.htmlSnippet}

出力形式は必ず以下のJSON形式にしてください。
{
  "overallScore": 0-100,
  "axes": [
    {
      "name": "技術・パフォーマンス",
      "score": 0-100,
      "feedback": "...",
      "improvements": ["...", "..."]
    },
    ...
  ],
  "summary": "全体的な評価のまとめ",
  "topAdvice": "最優先で取り組むべきアドバイス"
}

日本語で回答してください。
`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: data.screenshot
                    }
                }
            ]);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                console.log(`[Diagnostic] Success with model: ${modelName}`);
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse AI response');
        } catch (error: any) {
            const errorMessage = error.message || '';
            console.warn(`[Diagnostic] Failed with ${modelName}: ${errorMessage}`);
            lastError = error;

            // If it's a 429 (Rate Limit/Quota), we might want to inform the user specifically
            if (errorMessage.includes('429')) {
                lastError = new Error(`APIの利用制限（Quota）に達しました。しばらく時間を置いてから再度お試しいただくか、別のAPIキーをご使用ください。 (Model: ${modelName})`);
                continue; // Still try other models in case they have separate quotas
            }

            if (errorMessage.includes('404')) continue;

            if (errorMessage.includes('400') || errorMessage.includes('403')) {
                throw error;
            }
        }
    }

    throw lastError || new Error('解析中にエラーが発生しました。APIキーまたはネットワーク設定を確認してください。');
}
