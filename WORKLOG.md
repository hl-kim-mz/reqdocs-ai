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

## 2026-04-10 — Phase 2 완료 + Phase 3 진행 중

### 완료
- [x] **버그 수정**: `token` SSE 이벤트 → `appendStream` 미호출 (빈 문서 저장 문제)
- [x] `feature_spec` / `api_spec` / `erd` 프롬프트 + pipeline 라우팅 추가
- [x] `MermaidRenderer` 컴포넌트 (MarkdownViewer 내 mermaid 코드블록 자동 렌더링)
- [x] `@tailwindcss/typography` + `mermaid` 패키지 설치
- [x] Step 라벨 전체 docType 대응
- [x] **AbortController**: pipeline.ts signal 전달, route.ts request.signal 연결, new/page.tsx 취소 핸들러

### 완료 (Phase 3)
- [x] GenerationProgress 취소 버튼 UI
- [x] 재생성 버튼 (뷰어 SidePanel)
- [x] 인라인 편집 모드 (뷰어)

### 완료 (Phase 4 — 인증)
- [x] NextAuth v4 + Credentials provider (이메일/bcrypt)
- [x] Prisma v7 + SQLite (dev.db 마이그레이션 완료)
- [x] /register, /login 페이지
- [x] /workspace/* 미들웨어 보호
- [x] Topbar 유저 정보 + 로그아웃
- [x] Landing "시작하기" → /register 연결
- [x] next.config.ts → next.config.js (Next.js 14 호환)
- [x] 개발 포트 4000 고정

### 🔴 다음 세션 즉시 — 500 에러 수정
- 증상: /register POST 시 500 에러
- 의심 원인: Prisma v7 런타임에서 DATABASE_URL 미인식
- 시도한 수정: `new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })` → 미해결
- 다음 시도: 터미널 에러 로그 확인 → Prisma v7 런타임 설정 재검토
- 참고: dev.db 파일은 `web/` 루트에 생성됨 (`file:./dev.db`)

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
- [x] 스트리밍 이벤트 파싱 정상 동작 확인 (token 이벤트 → appendStream 버그 수정)
- [ ] 생성된 문서 내용 품질 검토 (프롬프트 튜닝 필요 여부 판단)

### 🟡 Phase 2 — 나머지 3종 문서 추가
- [x] 기능 명세서 프롬프트 + 생성 로직 (`feature_spec`)
- [x] API 문서 프롬프트 + OpenAPI 형식 출력 (`api_spec`)
- [x] ERD 프롬프트 + Mermaid 출력 (`erd`)
- [x] MermaidRenderer 컴포넌트 구현 (mermaid.js, MarkdownViewer 내 mermaid 코드블록 자동 감지)

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

- ~~`useProjectStore.getState().streamText` 타입~~ → `Record<DocType, string>` 확인됨, 정상
- SSE 이벤트 파싱: 멀티라인 chunk 분할 케이스 처리 검증 필요 (로컬 E2E 테스트 시 확인)
- ~~Tailwind prose 클래스: `@tailwindcss/typography` 플러그인 설치 여부 확인~~ → 설치 완료
