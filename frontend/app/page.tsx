'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('finalOutput');

  async function handleCompile() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('http://localhost:8080/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabs = ['finalOutput', 'intent', 'systemDesign', 'draftSchema', 'metrics'];

  return (
    <main style={{ minHeight: '100vh', background: '#0f0f0f', color: '#e5e5e5', fontFamily: 'monospace', padding: '40px 20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: '#a78bfa', margin: 0 }}>🤖 AI Compiler Platform</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>Natural language → Full app schema in seconds</p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px' }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='Describe your app... e.g. "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments."'
          rows={4}
          style={{
            width: '100%', padding: '16px', borderRadius: '8px',
            background: '#1a1a1a', border: '1px solid #333', color: '#e5e5e5',
            fontSize: '14px', resize: 'vertical', boxSizing: 'border-box'
          }}
        />
        <button
          onClick={handleCompile}
          disabled={loading || !prompt.trim()}
          style={{
            marginTop: '12px', width: '100%', padding: '14px',
            background: loading ? '#4c1d95' : '#7c3aed', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Compiling... (this takes ~10 seconds)' : '⚡ Compile App'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: '800px', margin: '0 auto 20px', padding: '16px', background: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: '#fca5a5' }}>
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Success banner */}
          <div style={{ padding: '12px 16px', background: '#052e16', border: '1px solid #16a34a', borderRadius: '8px', marginBottom: '20px', color: '#86efac' }}>
            ✅ Pipeline complete in {(result.metrics.totalMs / 1000).toFixed(1)}s &nbsp;|&nbsp;
            Intent: {result.metrics.stages.intent}ms &nbsp;|&nbsp;
            Design: {result.metrics.stages.systemDesign}ms &nbsp;|&nbsp;
            Schema: {result.metrics.stages.draftSchema}ms &nbsp;|&nbsp;
            Refine: {result.metrics.stages.finalSchema}ms
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none',
                  background: activeTab === tab ? '#7c3aed' : '#1a1a1a',
                  color: activeTab === tab ? 'white' : '#9ca3af',
                  cursor: 'pointer', fontSize: '13px'
                }}
              >
                {tab === 'finalOutput' ? '🏁 Final Schema' :
                 tab === 'intent' ? '🎯 Intent' :
                 tab === 'systemDesign' ? '🏗️ System Design' :
                 tab === 'draftSchema' ? '📝 Draft Schema' : '📊 Metrics'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <pre style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
            padding: '20px', overflow: 'auto', fontSize: '12px',
            color: '#86efac', maxHeight: '600px', lineHeight: '1.6'
          }}>
            {activeTab === 'metrics'
              ? JSON.stringify(result.metrics, null, 2)
              : activeTab === 'finalOutput'
              ? JSON.stringify(result.finalOutput, null, 2)
              : JSON.stringify(result.stages[activeTab], null, 2)
            }
          </pre>
        </div>
      )}
    </main>
  );
}