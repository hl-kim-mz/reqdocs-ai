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

### ✅ 500 에러 수정 완료 (2026-04-10)
- **원인**: Prisma v7은 `schema.prisma`에 `url` 필드 자체를 허용하지 않음. 런타임은 Driver Adapter 필수
- **수정**: `@prisma/adapter-libsql` + `@libsql/client` 설치 → `prisma.ts` PrismaLibSql adapter 방식으로 교체, `prisma generate` 재실행
- **검증 필요**: 서버 재시작 후 `/register` 페이지 회원가입 테스트

### 전략 방향 전환 — 서비스 핵심 플로우 재설계
- **기존**: 정리된 요구사항 입력 → 문서 생성 (기획 4단계만 커버)
- **변경**: 비정형 입력 → AI 요구사항 구조화 → 기획자 검토 → 문서 생성 (2+4단계 통합)
- **근거**: 기획팀 실무에서 가장 고마찰 구간은 "비정형 → 정형" 변환. 이 구간을 자동화해야 실질적인 개발 프로세스 자동화가 된다.
- 영향 문서: `01_service-overview.md`, `02_workflow.md`, `04_screen-design.md` 전면 수정 완료

---

## 다음 작업 (우선순위 순)

### 🔴 Phase A — 요구사항 구조화 엔진 (핵심 플로우 신설, 최우선)

> 서비스의 메인 플로우를 "비정형 입력 → AI 구조화 → 기획자 검토 → 문서 생성"으로 재설계.
> 기존 문서 생성 파이프라인은 구조화 결과를 받아 동작하도록 리팩터링.

- [ ] `structureRequirements()` 구현 — 비정형 텍스트 → `StructuredRequirement[]` JSON
  - 카테고리 분류: 기능 요구사항 / 비기능 요구사항 / 제약사항
  - 각 항목: `{ id, category, title, description, priority: MoSCoW, source }`
- [ ] `StructuredRequirement` 타입 정의 (`lib/types.ts`)
- [ ] `/api/structure` 엔드포인트 신설 (SSE 스트리밍)
- [ ] DB 스키마: `structured_requirements` 테이블 추가
- [ ] **S-04.5 화면 구현**: 요구사항 구조화 검토 (`/workspace/[id]/structure`)
  - 좌측 패널: 원본 입력 (읽기 전용, 접을 수 있음)
  - 메인: 카테고리별 요구사항 카드 목록
  - 인터랙션: MoSCoW 태그 변경 / 항목 추가·삭제 / 설명 인라인 편집
  - 하단 액션: [재분석] [문서 생성 →]
- [ ] 기존 문서 생성 파이프라인 리팩터링 — `rawInput` 대신 `structuredRequirements` 기반으로 생성

### 🟡 Phase B — 입력 확장 (파일 업로드)
- [ ] 파일 업로드 (`/api/upload`): `.txt` `.md` `.pdf` `.docx` 지원
  - pdf-parse (PDF), mammoth (DOCX) 텍스트 추출
  - 추출 결과 → textarea 자동 삽입
- [ ] 드래그앤드롭 FileDropzone 컴포넌트

### 🟡 Phase C — 저장 + 인증 고도화
- [ ] PostgreSQL + Prisma 셋업 (Railway) — SQLite → PostgreSQL 마이그레이션
- [ ] NextAuth.js Google OAuth 추가
- [ ] 프로젝트 저장 / 목록 / 이력 관리
- [ ] PDF / DOCX 내보내기

### 🔵 Phase D — 배포
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
