# ReqDocs AI - Next.js MVP

텍스트 입력으로 PRD와 기능 목록을 자동 생성하는 AI 기반 문서 생성 서비스입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **AI**: Claude API (@anthropic-ai/sdk)
- **상태 관리**: Zustand
- **마크다운**: react-markdown + remark-gfm

## 설치 및 실행

### 환경 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Anthropic API 키를 설정하세요:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 패키지 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 애플리케이션에 접속할 수 있습니다.

## 기능

### MVP 범위

1. **텍스트 입력** → 요구사항 입력
2. **자동 생성**
   - PRD (제품 요구사항 문서)
   - 기능 목록 (MoSCoW 우선순위)
3. **스트리밍** → Claude API SSE 실시간 응답
4. **세션 관리** → Zustand를 통한 클라이언트 상태 관리
5. **문서 뷰어**
   - 마크다운 렌더링
   - 복사 버튼 (마크다운 텍스트)
   - 다운로드 버튼 (.md 파일)

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃
│   ├── globals.css          # 전역 스타일
│   ├── page.tsx             # 랜딩 페이지
│   ├── api/
│   │   └── generate/
│   │       └── route.ts     # AI 생성 API (SSE)
│   └── workspace/
│       ├── new/
│       │   └── page.tsx     # 입력 화면
│       └── [projectId]/[tab]/
│           └── page.tsx     # 결과 뷰어
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # 메인 레이아웃
│   │   ├── Sidebar.tsx      # 좌측 네비게이션
│   │   └── Topbar.tsx       # 상단 바
│   ├── workspace/
│   │   ├── RequirementsEditor.tsx      # 요구사항 입력 창
│   │   ├── DocumentSelector.tsx        # 문서 종류 선택
│   │   └── GenerationProgress.tsx      # 생성 진행 상태
│   └── viewer/
│       ├── DocumentTabBar.tsx          # 탭 네비게이션
│       ├── MarkdownViewer.tsx          # 마크다운 렌더링
│       └── SidePanel.tsx               # 우측 정보 패널
├── lib/
│   ├── types.ts                 # 공통 타입 정의
│   └── ai/
│       ├── prompts.ts           # 프롬프트 정의
│       └── pipeline.ts          # AI 파이프라인
└── store/
    └── useProjectStore.ts       # Zustand 상태 관리
```

## 설계 정책

### 클라이언트 컴포넌트

`'use client'` 지시어가 필요한 컴포넌트:
- 상태 관리 (useState, useRouter 등)
- Zustand store 접근
- 이벤트 핸들러

### 서버 컴포넌트

`use client` 없이:
- API routes (`/api/**`)
- 레이아웃 (기본)

### 환경 변수

- `ANTHROPIC_API_KEY`: 서버사이드 only (NEXT_PUBLIC_ 접두사 없음)

## API

### POST /api/generate

요구사항을 바탕으로 문서를 생성합니다 (SSE 스트리밍).

**요청 본문**:
```json
{
  "rawInput": "요구사항 텍스트",
  "projectId": "프로젝트 ID",
  "docTypes": ["prd", "feature_list"]
}
```

**응답** (Server-Sent Events):
```
event: init
data: {"steps": [...]}

event: step
data: {"id": "prd", "status": "active"}

event: token
data: {"type": "prd", "token": "텍스트 토큰"}

event: done
data: {"type": "prd"}

event: complete
data: {"success": true}
```

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm run start
```

## 라이선스

MIT
