# ReqDocs AI — 작업 로그

> 레포: https://github.com/hl-kim-mz/reqdocs-ai

---

## 2026-04-09 — 초기 기획 + MVP 구현 ✅

- Next.js 14 App Router + TypeScript + Tailwind CSS 셋업
- Claude API SSE 스트리밍, PRD + 기능 목록 프롬프트
- Zustand 상태 관리, 입력/결과 화면, AppShell 레이아웃
- GitHub 레포 생성 + 초기 커밋 push

---

## 2026-04-10 — Phase A 완료 + AI 엔진 교체 ✅

### 인증 + DB
- NextAuth v4 + Credentials (이메일/bcrypt), /register · /login 페이지
- Prisma v7 + SQLite + `@prisma/adapter-libsql` (v7 Driver Adapter 방식)
- DB 모델: User · Project · StructuredRequirement · ProjectDocument

### 전략 방향 전환
- **기존**: 정리된 요구사항 → 문서 생성
- **변경**: 비정형 입력 → AI 구조화 → 기획자 검토 → 문서 생성
- 관련 문서 전면 수정: `01_service-overview.md`, `02_workflow.md`, `04_screen-design.md`

### Phase A — 요구사항 구조화 엔진
- `StructuredRequirement` 타입 + `lib/ai/structurer.ts` 구현
- `/api/structure` SSE 엔드포인트 (인증 필요, DB 저장)
- `/workspace/[id]/structure` 검토 화면 (카드 편집·삭제·추가, MoSCoW 변경, 재분석, 원본 접기)
- `/workspace/new` 플로우 전환: "요구사항 구조화 시작" → structure 페이지 자동 이동

### AI 엔진 교체 이력
1. Anthropic API → 크레딧 소진으로 사용 불가
2. Google Gemini API → 무료 할당량 초과
3. Ollama (qwen2.5:7b) → 로컬 CPU 실행으로 속도 심각하게 느림
4. **Groq API (llama-3.1-8b-instant)** → 현재 적용 ✅ (무료, 빠름)

### 음성 업로드 기능 (이번 세션 마지막)
- `/api/transcribe` — Groq Whisper (`whisper-large-v3-turbo`), 한국어, 25MB 제한
- `AudioUpload` 컴포넌트 — 드래그앤드롭, 변환 후 textarea 자동 삽입
- `/workspace/new` 에 AudioUpload 추가

### 버그 수정
- SSE `step` 이벤트 클라이언트 무시 → `updateStep` 호출로 수정
- LLM JSON 제어문자 파싱 오류 → 정제 로직 추가 (`structurer.ts`)
- `/register` 500 에러 → Prisma v7 adapter 방식으로 수정

---

---

## 2026-04-10 (세션 2) — E2E 안정화 + Phase B 완료 ✅

### SSE 파싱 버그 수정
- `web/src/lib/parseSSE.ts` 신규 생성 — `\n\n` 기준 이벤트 블록 파싱, 청크 경계에서 유실 없음
- `new/page.tsx`, `structure/page.tsx`, `[tab]/page.tsx` 3곳 모두 `parseSSEChunk` 적용

### Phase B — 파일 업로드 완료
- `/api/upload` 엔드포인트 — txt/md/pdf/docx 지원, 10MB 제한, 인증 필요
- `pdf-parse` + `mammoth` 설치 (서버 사이드 전용)
- `FileUpload` 컴포넌트 — 드래그앤드롭, 추출 후 textarea 자동 삽입
- `/workspace/new` 에 FileUpload 추가 (AudioUpload 아래)

---

## 다음 세션 작업 (우선순위 순)

### 🔴 즉시 — E2E 플로우 수동 검증
- [ ] 전체 플로우 직접 테스트: 텍스트/음성/파일 업로드 → 구조화 → 검토 → 문서 생성 → 뷰어
- [ ] structure 페이지 새로고침 시 redirect 동작 확인
- [ ] Groq 토큰 한도 초과 시 에러 처리 확인

### 🟡 Phase B — 추가 입력 확장
- [ ] 텍스트 파일 업로드 (`.txt` `.md`) — ✅ 완료
- [ ] PDF 업로드 — ✅ 완료
- [ ] DOCX 업로드 — ✅ 완료

### 🟡 Phase 2B — 문서 생성 프롬프트 리팩터링
- [ ] `rawInput` 기반 프롬프트 → `StructuredRequirement[]` 기반으로 전환
- [ ] 구조화 결과를 문서 생성에 실제로 활용 (현재는 rawInput 그대로 사용)

### 🟡 Phase C — 저장 + 인증 고도화
- [ ] 프로젝트 저장 / 목록 / 이력 관리 (현재 Zustand 세션 내 임시 저장)
- [ ] Google OAuth 추가
- [ ] MD / PDF / DOCX 내보내기

### 🔵 Phase D — 배포
- [ ] Vercel 배포 + 환경변수 설정
- [ ] Railway PostgreSQL 전환
- [ ] 도메인 연결

---

## 환경 설정

| 항목 | 값 |
|------|-----|
| 개발 포트 | `http://localhost:4000` |
| AI 엔진 | Groq `llama-3.1-8b-instant` (문서 생성) + Whisper `whisper-large-v3-turbo` (음성) |
| DB | SQLite `web/dev.db` (Prisma v7 + libsql adapter) |
| 환경변수 | `GROQ_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |

## 주요 파일 경로

| 항목 | 경로 |
|------|------|
| AI 구조화 | `web/src/lib/ai/structurer.ts` |
| AI 문서 생성 | `web/src/lib/ai/pipeline.ts` |
| Groq 스트리밍 | (groq-sdk 직접 사용, ollama.ts는 미사용) |
| SSE 구조화 API | `web/src/app/api/structure/route.ts` |
| SSE 생성 API | `web/src/app/api/generate/route.ts` |
| 음성 변환 API | `web/src/app/api/transcribe/route.ts` |
| 상태 관리 | `web/src/store/useProjectStore.ts` |
| 입력 화면 | `web/src/app/workspace/new/page.tsx` |
| 구조화 검토 | `web/src/app/workspace/[projectId]/structure/page.tsx` |
| 결과 뷰어 | `web/src/app/workspace/[projectId]/[tab]/page.tsx` |
| 요구사항 카드 | `web/src/components/structure/RequirementCard.tsx` |
| 음성 업로드 | `web/src/components/workspace/AudioUpload.tsx` |

## 알려진 이슈

- `ollama.ts` 파일이 남아 있음 (미사용, 삭제 가능)
- structure 페이지 새로고침 시 Zustand 초기화 → `/workspace/new` 리디렉션 (의도된 동작)
- 문서 생성 프롬프트가 아직 `rawInput` 기반 (structuredRequirements 미활용)
