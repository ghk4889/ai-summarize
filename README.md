# AI Document Summarizer

텍스트나 PDF 문서를 입력하면 AI가 **요약(summary) / 핵심 포인트(keyPoints) / 액션 아이템(actions)** 형태로 정리해주는 서비스입니다.

🔗 **Live Demo:** https://ai-summarize-sigma.vercel.app

---

## 주요 기능

- 텍스트 입력 → AI 요약 (summary / keyPoints / actions 구조화된 결과)
- PDF 파일 업로드 (클릭 또는 드래그앤드롭) → 텍스트 추출 → 요약
- 요약 결과 클립보드 복사
- 입력 예시 텍스트 제공
- 글자 수 제한 (500자) + 실시간 카운터
- 반응형 레이아웃 (모바일 지원)

## Tech Stack

| 영역 | 기술 |
|------|------|
| Backend | Java 21, Spring Boot, Gradle |
| Frontend | Next.js, TypeScript, TailwindCSS |
| AI | Claude API (claude-haiku-4-5-20251001) |
| PDF 처리 | Apache PDFBox |
| 배포 | Render (Backend), Vercel (Frontend) |
| 컨테이너 | Docker |
| 개발 도구 | Kiro-cli |

---

## 아키텍처

```
┌─────────────┐        POST /api/summarize        ┌──────────────┐        ┌─────────────┐
│   Browser   │ ───────────────────────────────▶  │ Spring Boot  │ ────▶  │ Claude API  │
│  (Next.js)  │                                   │   Backend    │        │             │
│             │ ◀───────────────────────────────  │ (Render)     │ ◀────  │ (Anthropic) │
└─────────────┘     { summary, keyPoints,         └──────────────┘        └─────────────┘
   (Vercel)            actions }                           │
                                                           │ PDF 업로드 시
                                                           ▼
                                                     ┌──────────────┐
                                                     │   PDFBox     │
                                                     │ (텍스트 추출)  │
                                                     └──────────────┘
```

**요청 흐름:**
1. 사용자가 텍스트 입력 또는 PDF 업로드
2. Frontend(Next.js)가 Backend API 호출
3. Backend가 (PDF인 경우 PDFBox로 텍스트 추출 후) Claude API 호출
4. Claude가 구조화된 JSON(summary/keyPoints/actions) 응답
5. Backend가 파싱하여 Frontend에 반환 → 카드형 UI로 표시

---

## 스크린샷

| 메인 화면 | 요약 결과 | PDF 업로드 |
|:---:|:---:|:---:|
| ![메인 화면](docs/images/main.png) | ![요약 결과](docs/images/summarize.png) | ![PDF 업로드](docs/images/pdf_upload.png) |

---

## API 명세

### POST /api/summarize

텍스트를 요약합니다.

**Request**
```json
{ "text": "요약할 텍스트 (최대 500자)" }
```

**Response** `200 OK`
```json
{
  "summary": "2-3문장 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2"],
  "actions": ["액션 아이템 1"]
}
```

**Error** `400` — 빈 텍스트 / 500자 초과
**Error** `502` — Claude API 오류
**Error** `504` — Claude API 타임아웃 (30초)

### POST /api/summarize/pdf

PDF 파일을 업로드하여 텍스트를 추출하고 요약합니다. (`multipart/form-data`, 최대 10MB)

**Request**: `file` (PDF)
**Response**: 위와 동일한 형식

**Error** `400` — 빈 파일 / PDF가 아닌 파일 / 텍스트 추출 불가

---

## 실행 방법

### Backend

```bash
# 환경변수 설정 필요
export CLAUDE_API_KEY=your-api-key

# IntelliJ에서 SummarizeApplication.java 실행 (JDK 21 필요)
# 또는
./gradlew bootRun
```

`application.properties` 주요 설정:
```properties
claude.api.key=${CLAUDE_API_KEY}
cors.allowed-origins=http://localhost:3000
spring.servlet.multipart.max-file-size=10MB
```

### Backend (Docker)

```bash
docker compose up --build
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`.env.local` 설정:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

http://localhost:3000 에서 접속

---

## 문서

- [개발 계획](docs/plan.md)
- [트러블슈팅 기록](docs/troubleshooting/)
- [개발 회고 블로그](docs/blog/retrospective/)
- [AI 활용 경험 블로그](docs/blog/ai-dev-experience/)

## Progress

- [x] Day 1: Backend base setup
- [x] Day 2: AI integration (Claude API)
- [x] Day 3: Frontend setup + prompt improvement + 연동
- [x] Day 4: 프론트-백 연동 완성 (CORS / 에러 처리 / E2E)
- [x] Day 5: 배포 준비 (Docker, Vercel, 환경변수 분리)
- [x] Day 6: 배포 실행
- [x] Day 7: 안정화 + 버그 수정
- [x] Day 8: UX 개선 + PDF 업로드
- [ ] Day 9: 요약 히스토리 (스킵)
- [x] Day 10: README + 문서 정리
- [x] Day 11: 블로그 글 작성 (1)
- [x] Day 12: 블로그 글 작성 (2)
- [ ] Day 13: 최종 점검
- [ ] Day 14: 완료 + 블로그 발행
