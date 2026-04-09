# ReqDocs AI

비정형 요구사항을 개발 문서로 자동 변환하는 웹 서비스

## 개요

회의록, 이메일, 기획 메모 등 비정형 입력을 받아 Claude AI가 분석하고,
개발에 필요한 정형 문서를 자동 생성합니다.

## 생성 문서 종류

| 문서 | 설명 |
|------|------|
| PRD | 제품 요구사항 정의서 |
| 기능 목록 | Feature List (MoSCoW 우선순위 포함) |
| 기능 명세서 | Functional Spec (기능별 상세 정의) |
| API 문서 | Endpoint 정의 (OpenAPI 3.0 형식) |
| ERD | Entity Relationship Diagram (Mermaid) |

## 문서 구조

```
docs/
├── 01_service-overview.md   서비스 개요 및 MVP 범위
├── 02_workflow.md           구현 워크플로우 (Phase별)
├── 03_architecture.md       시스템 아키텍처 및 기술 스택
├── 04_screen-design.md      화면 설계 (Desktop-first)
└── 05_components.md         컴포넌트 명세
```

## 기술 스택 (예정)

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI Engine**: Anthropic Claude API (claude-sonnet-4-6)
- **DB**: PostgreSQL (Prisma ORM)
- **Storage**: Supabase Storage or AWS S3
- **Auth**: NextAuth.js
- **Deploy**: Vercel + Railway

## 상태

- [x] 서비스 기획 완료
- [x] 화면 설계 완료 (Desktop-first)
- [ ] MVP 구현 예정
- [ ] 전체 기능 구현 예정
