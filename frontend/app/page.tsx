"use client"; // 이 컴포넌트는 브라우저에서 실행 (useState 등 사용 위해 필요)

import { useState, useRef } from "react";

// 백엔드 응답 데이터 구조 정의
interface SummarizeResult {
  summary: string;    // 요약문
  keyPoints: string[]; // 핵심 포인트 목록
  actions: string[];   // 액션 아이템 목록
}

export default function Home() {
  // 상태 변수들 (값이 바뀌면 화면 자동 재렌더링)
  const [text, setText] = useState("");                          // 텍스트 입력 내용
  const [result, setResult] = useState<SummarizeResult | null>(null); // 요약 결과
  const [loading, setLoading] = useState(false);                // 요약 중 여부
  const [error, setError] = useState("");                       // 에러 메시지
  const [mode, setMode] = useState<"text" | "pdf">("text");     // 현재 탭 (텍스트/PDF)
  const [fileName, setFileName] = useState("");                 // 선택된 PDF 파일명
  const [copied, setCopied] = useState("");                     // 복사 피드백

  // 숨겨진 file input을 코드에서 직접 조작하기 위한 참조
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_LENGTH = 500; // 텍스트 최대 입력 글자 수

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  // 폼 제출 핸들러 (요약하기 버튼 클릭 시 실행)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지
    if (mode === "text" && !text.trim()) return; // 텍스트 모드에서 빈 값이면 중단

    setLoading(true);
    setError("");
    setResult(null);

    try {
      let res: Response;

      if (mode === "pdf") {
        // PDF 모드: 파일을 FormData로 감싸서 전송
        const file = fileRef.current?.files?.[0]; // 숨긴 input에서 파일 꺼내기
        if (!file) {
          setError("PDF 파일을 선택해주세요.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summarize/pdf`, {
          method: "POST",
          body: formData,
        });
      } else {
        // 텍스트 모드: JSON으로 전송
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      // 응답 에러 처리
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `서버 오류 (${res.status})`);
      }

      const data: SummarizeResult = await res.json();
      setResult(data); // 결과 저장 → 화면에 표시됨
    } catch (err) {
      // 네트워크 연결 실패 (백엔드 미실행 등)
      if (err instanceof TypeError) {
        setError("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.");
      } else {
        setError(err instanceof Error ? err.message : "요약 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false); // 성공/실패 상관없이 로딩 종료
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Document Summarizer</h1>

        {/* 탭 전환 버튼 (텍스트 / PDF) */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            onClick={() => setMode("text")}
            className={`px-4 py-2 font-medium ${mode === "text" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            텍스트 입력
          </button>
          <button
            onClick={() => setMode("pdf")}
            className={`px-4 py-2 font-medium ${mode === "pdf" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            PDF 업로드
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          {/* 탭에 따라 다른 입력 UI 표시 */}
          {mode === "text" ? (
            <>
              {/* 텍스트 입력 영역 */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
                maxLength={MAX_LENGTH} // 브라우저 레벨에서 최대 글자 수 제한
                placeholder="요약할 텍스트를 입력하세요..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {/* 글자 수 카운터 (400자 초과 시 빨간색으로 변경) */}
              <div className="mt-1 flex justify-between text-sm text-gray-500">
                <button type="button" onClick={() => setText("Artificial intelligence is transforming industries worldwide. Companies are leveraging AI to automate repetitive tasks, enhance decision-making processes, and create personalized customer experiences. However, this rapid adoption raises important questions about job displacement, data privacy, and ethical use of technology. Organizations must balance innovation with responsible implementation.")} className="text-blue-500 hover:text-blue-700">
                  예시 텍스트로 시도
                </button>
                <span><span className={text.length > 400 ? "text-red-500" : ""}>{text.length.toLocaleString()}</span> / {MAX_LENGTH.toLocaleString()}자</span>
              </div>
            </>
          ) : (
            /* PDF 업로드 영역 (클릭 + 드래그앤드롭) */
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500", "bg-blue-50"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-500", "bg-blue-50"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/pdf") {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  if (fileRef.current) fileRef.current.files = dt.files;
                  setFileName(file.name);
                }
              }}
            >
              {/* 실제 file input은 숨기고, label 클릭으로 파일 선택창 열기 */}
              <input
                ref={fileRef}          // 코드에서 파일 접근용 참조
                type="file"
                accept=".pdf"          // PDF만 선택 가능
                disabled={loading}
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} // 파일명 상태 저장
                className="hidden"     // 기본 버튼 숨김
                id="pdf-upload"
              />
              {/* htmlFor로 위 input과 연결 → label 클릭 = input 클릭 */}
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-600">{fileName || "PDF 파일을 선택하세요"}</p>
                <p className="text-sm text-gray-400 mt-1">클릭 또는 드래그앤드롭</p>
              </label>
            </div>
          )}

          {/* 요약하기 버튼: 로딩 중이거나 입력값 없으면 비활성화 */}
          <button
            type="submit"
            disabled={loading || (mode === "text" && !text.trim()) || (mode === "pdf" && !fileName)}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {/* 로딩 중일 때 스피너 아이콘 표시 */}
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            )}
            {loading ? "요약 중..." : "요약하기"}
          </button>
        </form>

        {/* 에러 메시지 (에러가 있을 때만 표시) */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* 요약 결과 (결과가 있을 때만 표시) */}
        {result && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
            {/* 요약문 카드 */}
            <div className="p-6 bg-white rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-blue-700">📝 요약</h2>
                <button onClick={() => copyToClipboard(result.summary, "summary")} className="text-sm text-gray-400 hover:text-blue-600">
                  {copied === "summary" ? "✓ 복사됨" : "복사"}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>

            {/* 핵심 포인트 카드 */}
            <div className="p-6 bg-white rounded-lg shadow border-l-4 border-amber-500">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-amber-700">🔑 핵심 포인트</h2>
                <button onClick={() => copyToClipboard(result.keyPoints.join("\n"), "keyPoints")} className="text-sm text-gray-400 hover:text-amber-600">
                  {copied === "keyPoints" ? "✓ 복사됨" : "복사"}
                </button>
              </div>
              <ul className="space-y-2 text-gray-700">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 액션 아이템 카드 (있을 때만 표시) */}
            {result.actions.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow border-l-4 border-green-500">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-green-700">✅ 액션 아이템</h2>
                  <button onClick={() => copyToClipboard(result.actions.join("\n"), "actions")} className="text-sm text-gray-400 hover:text-green-600">
                    {copied === "actions" ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
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
