# 시스템 아키텍처 (System Architecture)

> v1.0 | 작성일: 2026-04-09

---

## 1. 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                       │
│   Next.js 14 App Router + TypeScript + Tailwind CSS            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│                      Next.js API Routes                         │
│                         (Vercel Edge)                           │
├──────────────────────────────────────────────────────────────────┤
│   Auth Middleware   Rate Limiter   Error Handler                │
└──────┬──────────────────┬───────────────────┬───────────────────┘
       │                  │                   │
┌──────▼──────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Claude API  │  │   PostgreSQL    │  │  File Storage  │
│ (Anthropic) │  │ (Railway/Prisma)│  │ (Supabase S3)  │
└─────────────┘  └─────────────────┘  └────────────────┘
```

---

## 2. AI 처리 파이프라인

```
[비정형 텍스트 입력]
        │
        ▼
┌───────────────────┐
│  전처리           │  길이 초과 시 청크 분할
│  (Preprocessing)  │  파일이면 텍스트 추출 먼저
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Step 1           │  도메인·엔티티·관계 추출
│  분석             │  Output: { entities, relationships, domain }
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Step 2           │  기능 분해 + MoSCoW 분류
│  기능 추출        │  Output: { features[{ name, priority, story }] }
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│  Step 3: 문서 생성 (선택된 종류만 병렬)   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│  │ PRD  │ │기능  │ │명세서│ │ API  │ │ERD││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──┘│
└────────┬──────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│  후처리           │  JSON Schema 검증
│  (Postprocessing) │  실패 시 자동 재시도 (max 3회)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  DB 저장 + 응답   │  Streaming으로 클라이언트에 전달
└───────────────────┘
```

---

## 3. 기술 스택 상세

### Frontend

| 항목 | 선택 | 이유 |
|------|------|------|
| Framework | Next.js 14 (App Router) | SSR + API Routes 일원화 |
| Language | TypeScript | 타입 안전성 |
| Styling | Tailwind CSS | 빠른 UI 개발 |
| Markdown | react-markdown + remark-gfm | PRD/명세서 렌더링 |
| Diagram | mermaid.js | ERD 렌더링 |
| State | Zustand (또는 React Context) | 경량 상태 관리 |

### Backend

| 항목 | 선택 | 이유 |
|------|------|------|
| Runtime | Next.js API Routes | 별도 서버 불필요 |
| ORM | Prisma | TypeScript 친화적 |
| DB | PostgreSQL | 관계형 데이터 적합 |
| Auth | NextAuth.js | OAuth 간편 통합 |
| File Parse | pdf-parse + mammoth | PDF/DOCX 텍스트 추출 |

### AI

| 항목 | 선택 | 이유 |
|------|------|------|
| Model | claude-sonnet-4-6 | 비용/품질 균형 |
| SDK | @anthropic-ai/sdk | 공식 Node.js SDK |
| Streaming | Server-Sent Events | 실시간 생성 표시 |

### Infra

| 항목 | 선택 | 이유 |
|------|------|------|
| Deploy | Vercel | Next.js 최적화 |
| DB Host | Railway | 간편한 PostgreSQL |
| Storage | Supabase Storage | 파일 업로드 |
| Monitor | Sentry + Vercel Analytics | 에러 + 트래픽 |

---

## 4. 환경 변수

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...

# DB
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://reqdocs.ai
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# 설정
MAX_INPUT_TOKENS=8000
MAX_FILE_SIZE_MB=10
RATE_LIMIT_RPM=10
```

---

## 5. 데이터 모델 (Prisma Schema)

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id             String          @id @default(cuid())
  userId         String
  title          String
  rawInput       String          @db.Text
  user           User            @relation(fields: [userId], references: [id])
  documents      Document[]
  analysisResult AnalysisResult?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model Document {
  id        String   @id @default(cuid())
  projectId String
  type      DocType
  content   String   @db.Text
  version   Int      @default(1)
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum DocType {
  prd
  feature_list
  feature_spec
  api_spec
  erd
}

model AnalysisResult {
  id            String  @id @default(cuid())
  projectId     String  @unique
  entities      Json
  features      Json
  relationships Json
  rawJson       Json
  project       Project @relation(fields: [projectId], references: [id])
}
```
