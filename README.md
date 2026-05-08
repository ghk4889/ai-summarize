# AI Document Summarizer

텍스트를 입력하면 AI가 summary, keyPoints, actions 형태로 요약해주는 서비스

## Tech Stack

- **Backend:** Java 21, Spring Boot, Gradle
- **Frontend:** Next.js, TailwindCSS
- **AI:** Claude API (claude-haiku-4-5-20251001)
- **개발 도구:** Kiro-cli

## 실행 방법

### Backend

```bash
# IntelliJ에서 SummarizeApplication.java 실행 (JDK 21 필요)
# 또는
./gradlew bootRun
```

`application.properties`에 Claude API 키 설정 필요:
```
claude.api.key=your-api-key
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 에서 접속

## Progress

- [x] Day 1: Backend base setup
- [x] Day 2: AI integration (Claude API)
- [x] Day 3: Frontend setup + prompt improvement + 연동
- [x] Day 4: 프론트-백 연동 완성 (CORS / 에러 처리 / E2E)
- [ ] Day 5: 배포 준비 (Docker, Vercel, 환경변수 분리)
- [ ] Day 6: 배포 실행
- [ ] Day 7: 안정화 + 버그 수정
- [ ] Day 8: UX 개선 + PDF 업로드
- [ ] Day 9: 요약 히스토리 (선택)
- [ ] Day 10: README + 문서 정리
- [ ] Day 11: 블로그 글 작성 (1)
- [ ] Day 12: 블로그 글 작성 (2)
- [ ] Day 13: 최종 점검
- [ ] Day 14: 완료 + 블로그 발행
