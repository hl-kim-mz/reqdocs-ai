# 구현 워크플로우 (Implementation Workflow)

> v2.0 | 최초 작성: 2026-04-09 | 수정: 2026-04-10  
> Strategy: Systematic | Persona: Architect → Backend → Frontend

---

## 전체 Phase 요약

| Phase | 기간 | 내용 |
|-------|------|------|
| Phase 1 | Week 1~2 | 기반 설계 (스택 확정, DB 설계, 흐름 정의) |
| **Phase 2A** | **Week 3** | **AI 요구사항 구조화 엔진 (핵심 신규)** |
| **Phase 2B** | **Week 4** | **AI 문서 생성 엔진 (구조화 결과 기반 리팩터링)** |
| Phase 3 | Week 4~5 | 백엔드 API 구현 |
| Phase 4 | Week 5~7 | 프론트엔드 구현 |
| Phase 5 | Week 7~8 | 통합 테스트 & 고도화 |
| Phase 6 | Week 8 | 배포 & 런칭 |

---

## Phase 1: 기반 설계 (Week 1~2)

### 1-1. 기술 스택

```
Frontend  : Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend   : Next.js API Routes
AI Engine : Anthropic Claude API (claude-sonnet-4-6)
DB        : PostgreSQL (Prisma ORM) — 개발: SQLite
Storage   : Supabase Storage or AWS S3
Auth      : NextAuth.js (Email/Password → Google OAuth)
Deploy    : Vercel (FE+BE) + Railway (DB)
```

### 1-2. DB 스키마

```sql
users                 (id, email, name, created_at)
projects              (id, user_id, title, raw_input, created_at)
structured_requirements (id, project_id, category, title, description,
                         priority, source, order, created_at)
  └─ category: '기능 요구사항' | '비기능 요구사항' | '제약사항'
  └─ priority: 'Must Have' | 'Should Have' | 'Could Have' | 'Won't Have'
documents             (id, project_id, type, content, version, created_at)
  └─ type: 'prd' | 'feature_list' | 'feature_spec' | 'api_spec' | 'erd'
```

### 1-3. 태스크

- [x] User Story 작성
- [x] API 엔드포인트 목록 초안
- [x] 프롬프트 엔지니어링 전략 수립
- [x] 문서 템플릿 설계 (산출물별)

---

## Phase 2A: AI 요구사항 구조화 엔진 (Week 3) ← 최우선

> 서비스의 핵심 차별화 기능. 비정형 입력을 검토 가능한 구조화 요구사항으로 변환.

### 구조화 파이프라인

```
[비정형 텍스트 입력]
   회의록 / 이메일 / 메모 (또는 파일 추출 텍스트)
        │
        ▼
┌───────────────────────┐
│  전처리               │  길이 초과 시 청크 분할
│  (Preprocessing)      │  파일이면 텍스트 추출 먼저
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 1: 도메인 파악  │  서비스 목적·배경·이해관계자 추출
│                       │  Output: { domain, purpose, stakeholders[] }
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 2: 요구사항     │  발화 단위로 요구사항 추출 및 분류
│  추출 및 분류         │  Output: StructuredRequirement[]
│                       │
│  각 항목:             │
│  - category (기능/    │
│    비기능/제약)       │
│  - title              │
│  - description        │
│  - priority (MoSCoW)  │
│  - source (원문 근거) │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  후처리               │  JSON Schema 검증
│  (Postprocessing)     │  실패 시 자동 재시도 (max 3회)
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  DB 저장 + SSE 응답   │  /api/structure → 클라이언트로 스트리밍
└───────────────────────┘
```

### 구현 함수

- [ ] `structureRequirements(rawInput)` — 비정형 텍스트 → `StructuredRequirement[]`
- [ ] `StructuredRequirement` 타입 정의 (`lib/types.ts`)
- [ ] JSON Schema 검증 + 재시도 로직
- [ ] `/api/structure` 엔드포인트 (SSE)

---

## Phase 2B: AI 문서 생성 엔진 (Week 4)

> 기존 `rawInput` 기반 생성을 `StructuredRequirement[]` 기반으로 리팩터링.
> 구조화된 요구사항을 입력받아 품질이 더 높은 문서를 생성.

### 문서 생성 파이프라인

```
[구조화된 요구사항] StructuredRequirement[]
        │
        ▼
┌─────────────────────────────────────────┐
│  Step 3: 문서 생성 (선택된 종류만 병렬)  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ ┌──┐│
│  │ PRD  │ │기능  │ │명세서│ │API │ │ERD││
│  └──────┘ └──────┘ └──────┘ └────┘ └──┘│
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌───────────────────────┐
│  후처리 + DB 저장      │  SSE로 클라이언트에 실시간 전달
└───────────────────────┘
```

### 구현 함수

- [x] `generatePRD(requirements)` — PRD Markdown 생성
- [x] `generateFeatureList(requirements)` — 기능 목록 + MoSCoW
- [x] `generateFeatureSpec(requirements)` — 기능 명세서
- [x] `generateAPISpec(requirements)` — OpenAPI 3.0 YAML
- [x] `generateERD(requirements)` — Mermaid ERD
- [ ] 각 함수 입력을 `rawInput` → `StructuredRequirement[]` 기반으로 리팩터링

---

## Phase 3: 백엔드 API 구현 (Week 4~5)

### API 엔드포인트

```
POST   /api/structure              비정형 입력 → 요구사항 구조화 (SSE)
PUT    /api/projects/:id/requirements  구조화 결과 수정 저장 (기획자 편집)

POST   /api/projects               프로젝트 생성
GET    /api/projects/:id           프로젝트 상세 조회
GET    /api/projects/:id/documents 생성된 문서 목록

POST   /api/documents/generate     문서 생성 (SSE)
GET    /api/documents/:id          문서 내용 조회
PUT    /api/documents/:id          문서 수동 편집 저장

POST   /api/upload                 파일 업로드 (DOCX, PDF, TXT)
GET    /api/export/:id?format=pdf  문서 내보내기
```

### 구현 태스크

- [x] Prisma ORM 셋업 + 마이그레이션 (SQLite)
- [ ] `structured_requirements` 테이블 마이그레이션 추가
- [ ] `/api/structure` 구현
- [ ] 파일 파싱 (pdf-parse, mammoth for DOCX)
- [x] Streaming API 응답 (`text/event-stream`)
- [ ] Rate Limiting (API 남용 방지)
- [x] 에러 핸들링 표준화

---

## Phase 4: 프론트엔드 구현 (Week 5~7)

### 라우트 구조

```
/                              랜딩 페이지
/login                         로그인
/register                      회원가입
/workspace                     대시보드 (프로젝트 목록)
/workspace/new                 새 프로젝트 — 비정형 입력
/workspace/[id]/structure      요구사항 구조화 검토 ← 신규 핵심 화면
/workspace/[id]/prd            PRD 탭
/workspace/[id]/features       기능 목록 탭
/workspace/[id]/spec           기능 명세서 탭
/workspace/[id]/api            API 문서 탭
/workspace/[id]/erd            ERD 탭
```

### 구현 태스크

- [x] AppShell (Topbar + Sidebar + Content 레이아웃)
- [x] RequirementsEditor (textarea + 글자 수 카운터)
- [ ] FileDropzone (드래그앤드롭 + 텍스트 추출)
- [x] GenerationProgress (스트리밍 진행 상태)
- [x] DocumentTabBar (탭 URL 연동)
- [x] MarkdownViewer (react-markdown)
- [x] MermaidRenderer (ERD 다이어그램)
- [ ] **StructureReviewPanel** — 구조화 결과 검토 UI (신규 핵심)
  - RequirementCard (카테고리·우선순위 태그 + 인라인 편집)
  - RequirementList (카테고리별 그룹 렌더링)
  - AddRequirementForm (항목 추가)
  - SourceTooltip (원문 근거 hover 표시)
- [ ] ExportMenu (MD / PDF / DOCX)

---

## Phase 5: 통합 테스트 & 고도화 (Week 7~8)

### 테스트 전략

| 종류 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | 구조화 엔진, 문서 생성 각 step |
| 통합 테스트 | Vitest | 입력 → 구조화 → 문서 생성 전체 흐름 |
| E2E 테스트 | Playwright | 입력 → 검토 → 생성 → 다운로드 |
| 프롬프트 품질 평가 | 수동 | 입력 샘플 10개 구조화 정확도 측정 |

### 품질 기준

- 요구사항 구조화 수정률 < 30% (기획자가 70% 이상 그대로 사용)
- 구조화 소요 시간 < 15초
- 전체 문서 생성 시간 < 60초
- API 응답 시간 < 200ms (문서 조회)

---

## Phase 6: 배포 (Week 8)

- [ ] Vercel 배포 설정 (환경변수 관리)
- [ ] Railway PostgreSQL 프로비저닝 + SQLite 마이그레이션
- [ ] `ANTHROPIC_API_KEY` 보안 관리
- [ ] 모니터링: Sentry (에러) + Vercel Analytics
- [ ] 도메인 연결 및 HTTPS 설정

---

## 병렬 작업 스트림

```
Stream A (AI/Backend) : Phase 2A → Phase 2B → Phase 3
Stream B (Frontend)   : Phase 4 (Phase 2A 완료 후 mock 데이터로 선행 가능)
Stream C (인프라)     : DB 설계, Vercel 설정, 환경 구성 (독립 진행)
```

---

## 리스크 & 완화 전략

| 리스크 | 가능성 | 영향 | 완화 방안 |
|--------|--------|------|-----------|
| 구조화 품질 불안정 | 중 | 상 | Few-shot 예제 + JSON 스키마 검증 + 재시도 + 기획자 편집 UI |
| AI 문서 출력 품질 불안정 | 중 | 상 | 구조화 결과 기반 생성으로 품질 안정화 |
| Claude API 비용 초과 | 중 | 중 | 토큰 추정 선표시 + 사용량 한도 설정 |
| 긴 입력 토큰 초과 | 중 | 중 | 청크 분할 + 요약 전처리 파이프라인 |
| ERD 정확도 낮음 | 상 | 중 | 수동 수정 UI 제공 + Mermaid 편집기 |
| 파일 파싱 실패 | 하 | 중 | 다중 파서 Fallback + 에러 메시지 안내 |
