# ReqDocs AI — 작업 로그

> 레포: https://github.com/hl-kim-mz/reqdocs-ai

---

## 2026-04-09 — 초기 기획 + MVP 구현

### 완료

#### 기획
- [x] 서비스 정의: 비정형 요구사항 → PRD·기능 목록·기능 명세·API 문서·ERD 자동 생성
- [x] 구현 워크플로우 수립 (Phase 1~6, 8주 계획)
- [x] 시스템 아키텍처 설계 (Next.js + Claude API + PostgreSQL)
- [x] 화면 설계 Desktop-first (S-01~S-08, 1440px 기준)
- [x] 컴포넌트 명세 (18개 컴포넌트 + 디자인 토큰)

#### 구현 (MVP)
- [x] Next.js 14 App Router + TypeScript + Tailwind CSS 셋업
- [x] Claude API SSE 스트리밍 (`/api/generate`)
- [x] PRD + 기능 목록 프롬프트 (한국어)
- [x] Zustand 상태 관리 (세션 내 저장, DB 없음)
- [x] 입력 화면 (`/workspace/new`) — 텍스트 입력 + 문서 선택
- [x] 결과 뷰어 (`/workspace/[id]/[tab]`) — Markdown 렌더링 + 복사/다운로드
- [x] AppShell 레이아웃 (사이드바 240px + Topbar 64px)
- [x] GitHub 레포 생성 + 초기 커밋 push

---

## 다음 작업 (우선순위 순)

### 🔴 즉시 — 로컬 실행 확인
```bash
cd reqdocs-ai/web
npm install
cp .env.local.example .env.local   # ANTHROPIC_API_KEY 입력
npm run dev                         # http://localhost:3000
```
- [ ] 랜딩 → 입력 → 생성 → 결과 E2E 흐름 수동 확인
- [ ] 스트리밍 이벤트 파싱 정상 동작 확인
- [ ] 생성된 문서 내용 품질 검토 (프롬프트 튜닝 필요 여부 판단)

### 🟡 Phase 2 — 나머지 3종 문서 추가
- [ ] 기능 명세서 프롬프트 + 생성 로직 (`feature_spec`)
- [ ] API 문서 프롬프트 + OpenAPI 형식 출력 (`api_spec`)
- [ ] ERD 프롬프트 + Mermaid 출력 (`erd`)
- [ ] MermaidRenderer 컴포넌트 구현 (mermaid.js + 줌/패닝)

### 🟡 Phase 3 — UX 고도화
- [ ] 파일 업로드 (PDF/DOCX → 텍스트 추출)
- [ ] 생성 취소 기능 (AbortController)
- [ ] 문서 인라인 편집 모드
- [ ] 재생성 버튼 (개별 문서)

### 🟢 Phase 4 — 저장 + 인증
- [ ] PostgreSQL + Prisma 셋업 (Railway)
- [ ] NextAuth.js 로그인 (Google OAuth)
- [ ] 프로젝트 저장 / 목록 / 이력 관리
- [ ] PDF / DOCX 내보내기

### 🔵 Phase 5 — 배포
- [ ] Vercel 배포 + 환경변수 설정
- [ ] 도메인 연결
- [ ] Sentry 에러 모니터링 연동

---

## 주요 파일 경로

| 항목 | 경로 |
|------|------|
| AI 프롬프트 | `web/src/lib/ai/prompts.ts` |
| AI 파이프라인 | `web/src/lib/ai/pipeline.ts` |
| SSE API | `web/src/app/api/generate/route.ts` |
| 상태 관리 | `web/src/store/useProjectStore.ts` |
| 입력 화면 | `web/src/app/workspace/new/page.tsx` |
| 결과 뷰어 | `web/src/app/workspace/[projectId]/[tab]/page.tsx` |
| 환경변수 템플릿 | `web/.env.local.example` |

---

## 알려진 이슈 / 확인 필요

- `useProjectStore.getState().streamText` 타입 — `streamText`가 `string`인지 `Record<DocType, string>`인지 확인 필요 (pipeline 연동 시)
- SSE 이벤트 파싱: 멀티라인 chunk 분할 케이스 처리 검증 필요
- Tailwind prose 클래스: `@tailwindcss/typography` 플러그인 설치 여부 확인
