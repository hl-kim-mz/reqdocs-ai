# 구현 워크플로우 (Implementation Workflow)

> v1.0 | 작성일: 2026-04-09  
> Strategy: Systematic | Persona: Architect → Backend → Frontend

---

## 전체 Phase 요약

| Phase | 기간 | 내용 |
|-------|------|------|
| Phase 1 | Week 1~2 | 기반 설계 (스택 확정, DB 설계, 흐름 정의) |
| Phase 2 | Week 3~4 | AI 엔진 구현 (핵심) |
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
DB        : PostgreSQL (Prisma ORM)
Storage   : Supabase Storage or AWS S3
Auth      : NextAuth.js (Google/GitHub OAuth)
Deploy    : Vercel (FE+BE) + Railway (DB)
```

### 1-2. DB 스키마 초안

```sql
users            (id, email, name, created_at)
projects         (id, user_id, title, raw_input, created_at)
documents        (id, project_id, type, content, version, created_at)
  └─ type: 'prd' | 'feature_list' | 'feature_spec' | 'api_spec' | 'erd'
analysis_results (id, project_id, entities, features, relationships, raw_json)
```

### 1-3. 태스크

- [ ] User Story 작성 (5개 핵심 페르소나)
- [ ] API 엔드포인트 목록 초안
- [ ] 프롬프트 엔지니어링 전략 수립
- [ ] 문서 템플릿 설계 (산출물별)

---

## Phase 2: AI 엔진 구현 (Week 3~4) ← 핵심

### 프롬프트 파이프라인 (Multi-step Chain)

```
Step 1: 도메인 & 엔티티 추출
  Input  : 비정형 텍스트
  Output : { entities[], relationships[], domain, purpose }

Step 2: 기능 분해
  Input  : Step 1 결과 + 원문
  Output : { features[{ name, description, priority, userStory }] }

Step 3: 문서별 생성
  Input  : Step 1+2 결과
  Output : 각 문서 타입별 구조화된 JSON/Markdown
```

### 구현 함수 목록

- [ ] `analyzeRequirements()` — 비정형 텍스트 → 구조화 분석
- [ ] `generatePRD()` — PRD Markdown 생성
- [ ] `generateFeatureList()` — 기능 목록 + MoSCoW 우선순위
- [ ] `generateFeatureSpec()` — 기능 명세서 (조건/예외 포함)
- [ ] `generateAPISpec()` — OpenAPI 3.0 YAML 생성
- [ ] `generateERD()` — Mermaid 문법 ERD 생성
- [ ] Streaming 응답 구현 (`ReadableStream`)

### 프롬프트 품질 관리

- Few-shot 예제 내장 (입력→출력 쌍 5~10개)
- JSON Schema Validation (파싱 실패 시 자동 재시도)
- 긴 입력 청크 분할 처리 (토큰 초과 방지)

---

## Phase 3: 백엔드 API 구현 (Week 4~5)

### API 엔드포인트

```
POST   /api/projects               프로젝트 생성 + 분석 시작
GET    /api/projects/:id           프로젝트 상세 조회
GET    /api/projects/:id/documents 생성된 문서 목록

POST   /api/documents/generate     특정 문서 타입 생성
GET    /api/documents/:id          문서 내용 조회
PUT    /api/documents/:id          문서 수동 편집 저장
DELETE /api/documents/:id          문서 삭제

POST   /api/upload                 파일 업로드 (DOCX, PDF, TXT)
GET    /api/export/:id?format=pdf  문서 내보내기
```

### 구현 태스크

- [ ] Prisma ORM 셋업 + 마이그레이션
- [ ] API Routes 구현 (인증 미들웨어 포함)
- [ ] 파일 파싱 (pdf-parse, mammoth for DOCX)
- [ ] Streaming API 응답 (`text/event-stream`)
- [ ] Rate Limiting (API 남용 방지)
- [ ] 에러 핸들링 표준화

---

## Phase 4: 프론트엔드 구현 (Week 5~7)

### 라우트 구조

```
/                        랜딩 페이지
/auth/login              로그인
/workspace               대시보드 (프로젝트 목록)
/workspace/new           새 프로젝트 생성
/workspace/[id]          결과 문서 뷰어
/workspace/[id]/prd      PRD 탭
/workspace/[id]/features 기능 목록 탭
/workspace/[id]/spec     기능 명세서 탭
/workspace/[id]/api      API 문서 탭
/workspace/[id]/erd      ERD 탭
```

### 구현 태스크

- [ ] AppShell (Topbar + Sidebar + Content 레이아웃)
- [ ] RequirementsEditor (textarea + 글자 수 카운터)
- [ ] FileDropzone (드래그앤드롭 + 텍스트 추출)
- [ ] GenerationProgress (스트리밍 진행 상태)
- [ ] DocumentTabBar (5개 탭 URL 연동)
- [ ] MarkdownViewer (react-markdown)
- [ ] MermaidRenderer (ERD 다이어그램 + 줌/패닝)
- [ ] ApiTable (엔드포인트 목록, 메서드별 색상)
- [ ] ExportMenu (MD / PDF / DOCX)

---

## Phase 5: 통합 테스트 & 고도화 (Week 7~8)

### 테스트 전략

| 종류 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | AI 파이프라인 각 step |
| 통합 테스트 | Vitest | API → DB → 문서 생성 전체 흐름 |
| E2E 테스트 | Playwright | 입력 → 생성 → 다운로드 |
| 프롬프트 품질 평가 | 수동 | 입력 샘플 10개 정확도 측정 |

### 품질 기준

- PRD 생성 정확도 > 80% (도메인 일치율)
- 생성 소요 시간 < 30초
- API 응답 시간 < 200ms (문서 조회)

---

## Phase 6: 배포 (Week 8)

- [ ] Vercel 배포 설정 (환경변수 관리)
- [ ] Railway PostgreSQL 프로비저닝
- [ ] `ANTHROPIC_API_KEY` 보안 관리
- [ ] 모니터링: Sentry (에러) + Vercel Analytics
- [ ] 도메인 연결 및 HTTPS 설정

---

## 병렬 작업 스트림

```
Stream A (AI/Backend) : Phase 2 → Phase 3
Stream B (Frontend)   : Phase 4 (Phase 2 완료 후 스텁 API로 선행 가능)
Stream C (인프라)     : DB 설계, Vercel 설정, 환경 구성 (독립 진행)
```

---

## 리스크 & 완화 전략

| 리스크 | 가능성 | 영향 | 완화 방안 |
|--------|--------|------|-----------|
| AI 출력 품질 불안정 | 중 | 상 | Few-shot 예제 + JSON 스키마 검증 + 재시도 |
| Claude API 비용 초과 | 중 | 중 | 토큰 추정 선표시 + 사용량 한도 설정 |
| 긴 입력 토큰 초과 | 중 | 중 | 청크 분할 + 요약 전처리 파이프라인 |
| ERD 정확도 낮음 | 상 | 중 | 수동 수정 UI 제공 + Mermaid 편집기 |
| 파일 파싱 실패 | 하 | 중 | 다중 파서 Fallback + 에러 메시지 안내 |
