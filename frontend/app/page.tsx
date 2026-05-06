"use client";

import { useState } from "react";

interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  actions: string[];
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://localhost:8080/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: SummarizeResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요약 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Document Summarizer</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="요약할 텍스트를 입력하세요..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "요약 중..." : "요약하기"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">📝 요약</h2>
              <p className="text-gray-700">{result.summary}</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">🔑 핵심 포인트</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {result.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            {result.actions.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">✅ 액션 아이템</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {result.actions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
