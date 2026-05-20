# AI Document Summarizer — 2주 개발 계획

## 프로젝트 개요

텍스트를 입력하면 AI가 summary, keyPoints, actions 형태로 요약해주는 서비스

## 기술 스택

- Backend: Java 21, Spring Boot, Gradle
- Frontend: Next.js, TailwindCSS
- AI: Claude API
- 개발 도구: Kiro-cli

---

## Week 1: 핵심 기능 완성 + 배포

### Day 1 ✅ — Backend 기본 세팅
- Spring Boot 프로젝트 생성
- POST /api/summarize 구현
- GitHub repository 생성 및 push
- Git 기본 구조 세팅

### Day 2 ✅ — AI 연동
- Claude API 연동 완료
- AI 요약 응답 반환 성공
- Controller → Service 구조 정리

### Day 3 ✅ — 프론트엔드 기본 세팅 + 프롬프트 개선
- Next.js 프로젝트 생성
- TailwindCSS 설정
- 텍스트 입력 폼 + 요약 결과 표시 UI 구현
- `/api/summarize` 호출 연동
- 프롬프트 개선: summary / keyPoints / actions 구조화된 JSON 응답 유도
- 응답 파싱 로직 추가

### Day 4 ✅ — 프론트-백 연동 완성
- CORS 설정
- 로딩 상태 / 에러 처리 UI
- 요약 결과(summary, keyPoints, actions) 카드형 표시
- 기본 동작 E2E 확인

### Day 5 ✅ — 배포 준비
- Backend: Docker 이미지 빌드 설정
- Frontend: Vercel 배포 설정
- 환경변수 분리 (API key 등)

### Day 6 ✅ — 배포 실행
- Backend 배포 (AWS EC2 / Railway / Render)
- Frontend Vercel 배포
- 실서비스 동작 확인

### Day 7 ✅ — 안정화 + 버그 수정
- 배포 환경 버그 수정
- 입력 길이 제한 / validation 추가
- 에러 응답 정리

---

## Week 2: 개선 + 기록 + 마무리

### Day 8 ✅ — UX 개선 + PDF 업로드
- PDF 파일 업로드 → 텍스트 추출(PDFBox) → 요약 기능 추가
- 요약 결과 복사 버튼
- 입력 예시 텍스트 제공
- 반응형 레이아웃 확인

### Day 9 — 요약 히스토리 (선택)
- LocalStorage 기반 최근 요약 목록 저장
- 히스토리 리스트 UI

### Day 10 — README + 문서 정리
- README.md 완성 (스크린샷, 기술스택, 실행방법)
- 아키텍처 다이어그램 간단히 작성

### Day 11 — 블로그 글 작성 (1)
- "2주 만에 AI 서비스 만들기" 회고 초안
- 개발 과정 타임라인 정리

### Day 12 — 블로그 글 작성 (2)
- Kiro-cli / AI 활용 개발 경험 정리
- 코드 예시 + 스크린샷 포함

### Day 13 — 최종 점검
- 배포 서비스 전체 테스트
- GitHub repo 정리 (불필요 파일 제거, .gitignore 확인)
- 포트폴리오 설명 문구 작성

### Day 14 — 완료
- 최종 배포 확인
- 블로그 발행
- LinkedIn / 포트폴리오 업데이트

---

## 핵심 마일스톤

| 시점 | 목표 |
|------|------|
| Day 4 | 프론트-백 연동 동작 확인 |
| Day 6 | **첫 배포 완료** |
| Day 7 | 안정화 완료 |
| Day 10 | 문서 정리 완료 |
| Day 14 | 블로그 발행 + 프로젝트 종료 |

---

## 운영 원칙

- 완벽주의 금지 — "완성" 우선
- 프론트엔드 과몰입 금지
- DTO/아키텍처 과설계 금지
- Day 7 이전 반드시 배포 준비
- 하루 최소 1 commit
- 프롬프트 튜닝 오래 하지 말 것
