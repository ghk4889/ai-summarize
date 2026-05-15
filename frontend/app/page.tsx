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

  const MAX_LENGTH = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `서버 오류 (${res.status})`);
      }
      const data: SummarizeResult = await res.json();
      setResult(data);
    } catch (err) {
      if (err instanceof TypeError) {
        setError("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.");
      } else {
        setError(err instanceof Error ? err.message : "요약 중 오류가 발생했습니다.");
      }
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
            disabled={loading}
            maxLength={MAX_LENGTH}
            placeholder="요약할 텍스트를 입력하세요..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="mt-1 text-right text-sm text-gray-500">
            <span className={text.length > 400 ? "text-red-500" : ""}>{text.length.toLocaleString()}</span> / {MAX_LENGTH.toLocaleString()}자
          </div>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            )}
            {loading ? "요약 중..." : "요약하기"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
            <div className="p-6 bg-white rounded-lg shadow border-l-4 border-blue-500">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">📝 요약</h2>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow border-l-4 border-amber-500">
              <h2 className="text-lg font-semibold mb-2 text-amber-700">🔑 핵심 포인트</h2>
              <ul className="space-y-2 text-gray-700">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.actions.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow border-l-4 border-green-500">
                <h2 className="text-lg font-semibold mb-2 text-green-700">✅ 액션 아이템</h2>
                <ul className="space-y-2 text-gray-700">
                  {result.actions.map((action, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{action}</span>
                    </li>
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
