'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Target, Info, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvaluationResult {
  evaluation: {
    overallScore: number;
    axes: {
      name: string;
      score: number;
      feedback: string;
      improvements: string[];
    }[];
    summary: string;
    topAdvice: string;
  };
  screenshot: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, apiKey }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '評価中にエラーが発生しました');

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1>LP分析ツール</h1>
      </header>

      <section className="section-container">
        <form onSubmit={handleEvaluate}>
          <div className="input-area">
            <div className="field">
              <label>ターゲットURL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-text"
                required
              />
            </div>
          </div>

          <div className="input-bottom-bar">
            <div className="field" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.1em' }}>GEMINI APIキー</label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="link-red">キーを取得 →</a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <button type="submit" className="btn-action" disabled={isLoading}>
              <span>{isLoading ? '分析中...' : '分析を開始'}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: 'var(--primary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '4rem' }}
          >
            <div className="result-card">
              <div className="result-header">
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>総合評価</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AIによる多角的な分析結果です。</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="score-display">{result.evaluation.overallScore}</div>
                  <div className="score-label">OVERALL SCORE</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                {result.evaluation.summary}
              </p>
            </div>

            <div className="grid-2">
              <div className="result-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} color="var(--primary)" />
                  最優先のアドバイス
                </h3>
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.375rem', borderLeft: '4px solid var(--primary)' }}>
                  <p style={{ fontWeight: 600 }}>{result.evaluation.topAdvice}</p>
                </div>
              </div>
              <div className="result-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={18} color="var(--primary)" />
                  詳細スコアの内訳
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.evaluation.axes.map((axis, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{axis.name}</span>
                      <span className="badge-red">{axis.score}点</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="result-card" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>分析対象のスクリーンショット</h3>
              <img
                src={`data:image/png;base64,${result.screenshot}`}
                alt="Target Screenshot"
                style={{ width: '100%', height: 'auto', borderRadius: '0.375rem', border: '1px solid var(--border)' }}
              />
            </div>

            {result.evaluation.axes.map((axis, i) => (
              <div key={i} className="result-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{axis.name}</h3>
                  <span className="badge-red">{axis.score} / 100</span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{axis.feedback}</p>
                <div className="improvement-list">
                  {axis.improvements.map((imp, j) => (
                    <div key={j} className="improvement-item">{imp}</div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
