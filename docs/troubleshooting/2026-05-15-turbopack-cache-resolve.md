# Next.js Turbopack 캐시로 인한 tailwindcss resolve 실패

- 작성일: 2026-05-15
- 프로젝트: AI Document Summarizer
- 환경: Windows, IntelliJ, Next.js 16.2.4 (Turbopack)

---

## 1. 현상

`npm run dev` 실행 시 아래 에러 발생:

```
Error: Can't resolve 'tailwindcss' in 'D:\coding_proj\privacy\ai-summarizer'
```

`frontend` 디렉토리에서 실행했음에도 상위 디렉토리에서 tailwindcss를 찾으려 함.

---

## 2. 원인

이전에 프로젝트 루트에 `package-lock.json`이 있을 때 빌드된 `.next` 캐시가 남아있었다. Turbopack이 캐시된 resolve 경로(상위 디렉토리)를 계속 사용한 것.

`package-lock.json` 삭제 후에도 캐시가 갱신되지 않아 문제가 지속됨.

---

## 3. 해결

```powershell
# powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

`.next` 폴더 삭제로 캐시를 초기화하면 새로 resolve하면서 정상 동작.

---

## 4. 교훈

- 빌드 설정이나 프로젝트 구조를 변경한 후에는 `.next` 캐시를 삭제하고 확인할 것.
- Turbopack은 resolve 결과를 적극적으로 캐싱하므로, 경로 관련 문제 발생 시 캐시 삭제를 먼저 시도.
