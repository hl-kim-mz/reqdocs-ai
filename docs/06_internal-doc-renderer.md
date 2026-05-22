# 사내 문서 렌더링 (Internal Doc Renderer)

> v1.0 | 작성일: 2026-05-22
> Goal: 사내 HTML/MD 문서를 다운로드 없이 어떤 디바이스에서든 즉시 열람
> Scope: ReqDocs AI와 무관한 **별도 서비스**로 구축

---

## 1. 문제 정의

### 1-1. 현재 상태

- 사내 자료가 `.html`, `.md` 형식으로 작성·공유됨 (기획서, 디자인 가이드, UI 킷 등)
- 공유 채널은 Slack 중심
- `.html` 첨부는 Slack에서 미리보기가 안 되고, 모바일에서는 다운로드 후 외부 앱으로 열어야 함
- `.md`도 GitHub/IDE 없이 보면 raw 텍스트로만 표시됨
- 결과: "링크 한 줄로 누구에게나 보여주기" 가 불가능

### 1-2. 해결하려는 것

- Slack에 URL 한 줄 붙여넣으면 모바일·태블릿·데스크톱 어디서나 즉시 렌더링
- Google Workspace 계정으로 접근 제어
- HTML/MD 모두 지원 (이미지·다이어그램·코드 블록 포함)
- 작성자만 본인 문서 편집·삭제

### 1-3. Non-goal

- 외부(고객) 공개용 위키/CMS 대체
- 실시간 협업 편집 (Notion·Confluence 수준)
- 풀텍스트 검색 엔진 (초기 범위 외)
- Git 리포지토리 동기화 (업로드 기반만)

---

## 2. 확정 사항 (Decisions)

| 항목 | 결정 |
|---|---|
| 배치 | **별도 서비스** (ReqDocs AI와 코드·DB·도메인 모두 분리) |
| 인증 | **Google Workspace SSO** (회사 도메인만 허용) |
| 문서 원천 | **업로드만** — Git 동기화·외부 fetch 없음 |
| 편집 권한 | **작성자(업로더)만** 편집·삭제 가능 |
| 콘텐츠 격리 | **도메인 분리** + sandbox iframe (이중 방어) |
| Slack 통합 | **후순위** — 단순 링크 공유로 시작, unfurl/검색은 차후 features |

---

## 3. 핵심 시나리오

```
[작성자]                                    [수신자]
  │                                            │
  │ 1. HTML/MD 업로드                          │
  ▼                                            │
[Renderer]──2. 짧은 공유 URL 발급─────────────▶│
                                               │ 3. Slack에 URL 붙여넣기
                                               ▼
                                       [수신자 클릭]
                                               │
                                               ▼
                                Google Workspace SSO 통과
                                               │
                                               ▼
                                  브라우저에서 즉시 렌더링
```

대표 흐름:
1. 작성자가 `docs.<사내도메인>` 에 로그인 → 파일 업로드
2. 시스템이 `docs.<사내도메인>/d/<slug>` URL 발급
3. Slack 채널에 URL 공유
4. 동료가 모바일 Slack에서 링크 탭 → Google SSO → 렌더링 페이지

---

## 4. 시스템 아키텍처

### 4-1. 도메인 구성

```
docs.<사내>.com         ← 메인 앱 (UI, API, 세션 쿠키)
content.<사내>.com      ← 업로드된 HTML "원본"만 서빙 (격리 origin)
```

같은 호스트(서버)를 가리켜도 됩니다. Host 헤더로 분기.

- `docs.*` : 로그인 페이지, 업로드, 목록, 렌더링 페이지 (iframe 컨테이너)
- `content.*` : sandbox iframe 안에 로드되는 원본 HTML/MD-변환-HTML만 응답. 세션 쿠키 절대 발급 안 함. 다른 모든 경로는 404.

### 4-2. 전체 다이어그램

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT (Any device)                    │
│   Slack 모바일 → 브라우저 → 반응형 Reader UI                │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│              Next.js 14 App (별도 배포)                      │
│   docs.<사내>.com  ──  메인 UI / API / 인증                  │
│   content.<사내>.com  ─  원본 파일 서빙 (sandbox iframe 안)  │
├──────────────────────────────────────────────────────────────┤
│   NextAuth(Google)  ACL  Sanitize  Rate-limit  Audit log     │
└────┬──────────────────┬─────────────────────────────────────┘
     │                  │
┌────▼─────┐    ┌───────▼────────┐
│ PostgreSQL│    │ Object Storage │
│ 문서 메타·│    │ 원본 .html/.md │
│ 권한·로그 │    │ 첨부 이미지    │
└──────────┘    └────────────────┘
```

### 4-3. 렌더링 파이프라인

```
[저장된 원본 파일] ── fetch ──▶ [MIME 분기]
        │                          │
        │                ┌─────────┴─────────┐
        │                ▼                   ▼
        │              .md                 .html
        │                │                   │
        │                ▼                   ▼
        │     remark/rehype 파이프라인   content.<사내>로 redirect
        │     - GFM, table, task list   해당 도메인에서 sandbox
        │     - mermaid 다이어그램      iframe 안에 srcdoc 로딩
        │     - shiki 코드 하이라이트   sandbox="allow-scripts"
        │     - DOMPurify sanitize      (allow-same-origin 제외)
        │                │                   │
        │                └─────────┬─────────┘
        │                          ▼
        └────────────────▶  React 컴포넌트로 렌더 + 목차/공유 메타
```

---

## 5. 보안 모델

| 위협 | 대응 |
|---|---|
| 업로드 HTML 내 `<script>` XSS | `content.<사내>` 별도 origin + sandbox iframe (`allow-same-origin` 제외) |
| sandbox 우회 시도 | 별도 origin이라 `docs.<사내>` 세션 쿠키 접근 불가 (브라우저 강제) |
| Markdown 내 raw HTML/inline JS | rehype-sanitize + DOMPurify 화이트리스트 |
| 외부 fetch/추적 | CSP `default-src 'self'; img-src ...; connect-src 'none'` |
| 비-사내 사용자 접근 | NextAuth Google Provider + `hd=<회사도메인>` 강제 |
| 링크 무한 공유 | 만료(`expiresAt`) + 조회수/감사 로그 |
| 첨부 파일 직접 접근 | Storage 직접 노출 금지, 5분 짜리 signed URL 발급 |
| 작성자 외 변조 | API 단에서 `ownerId === session.userId` 검증 |

### 5-1. Google Workspace 도메인 제한

```ts
// next-auth.config.ts
GoogleProvider({
  authorization: { params: { hd: "<회사도메인>.com" } },  // Hosted Domain
  // hd 파라미터는 Google 측에서도 강제, 콜백에서도 재검증
}),
callbacks: {
  signIn: ({ user }) => user.email?.endsWith("@<회사도메인>.com") ?? false,
}
```

---

## 6. 데이터 모델 (Prisma)

```prisma
model User {
  id        String      @id @default(cuid())
  email     String      @unique             // @<회사도메인>.com 강제
  name      String?
  image     String?
  docs      SharedDoc[]
  createdAt DateTime    @default(now())
}

model SharedDoc {
  id          String     @id @default(cuid())
  slug        String     @unique           // 짧은 공유 URL (nanoid 7자리)
  ownerId     String
  title       String
  summary     String?                      // 목록·추후 unfurl용 1~2줄
  format      DocFormat
  storagePath String                       // S3/Supabase 경로
  visibility  Visibility @default(ORG)     // ORG=사내전체, PRIVATE=초대된 사람
  expiresAt   DateTime?
  views       Int        @default(0)
  owner       User       @relation(fields: [ownerId], references: [id])
  assets      DocAsset[]
  versions    DocVersion[]
  deletedAt   DateTime?                    // 소프트 삭제
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model DocVersion {                          // 작성자가 재업로드 시 이전 버전 보관
  id          String    @id @default(cuid())
  docId       String
  storagePath String
  note        String?
  createdAt   DateTime  @default(now())
  doc         SharedDoc @relation(fields: [docId], references: [id], onDelete: Cascade)
}

model DocAsset {                            // 이미지 등 첨부
  id          String    @id @default(cuid())
  docId       String
  filename    String
  storagePath String
  mimeType    String
  doc         SharedDoc @relation(fields: [docId], references: [id], onDelete: Cascade)
}

model DocView {                             // 감사 로그
  id        String   @id @default(cuid())
  docId     String
  viewerId  String?
  viewedAt  DateTime @default(now())
  userAgent String?
}

enum DocFormat  { md html }
enum Visibility { ORG PRIVATE }
```

---

## 7. URL 규약

| 항목 | 규칙 |
|---|---|
| 공유 URL | `https://docs.<사내>.com/d/<slug>` |
| 원본 (iframe src) | `https://content.<사내>.com/raw/<slug>` |
| Slug | `nanoid(7)` — 7자 base62, 충돌 무시 가능 |
| 만료 | 기본 무기한, 옵션 7/30/90일 |
| 비공개 | 작성자만 토글 (`ORG` ↔ `PRIVATE`) |

---

## 8. 권한 모델

| 액션 | ORG | PRIVATE | 비고 |
|---|---|---|---|
| 보기 | 사내 SSO 통과한 누구나 | 작성자 + 명시 초대자 | |
| 편집 (재업로드) | 작성자만 | 작성자만 | 새 버전으로 적재 |
| 삭제 | 작성자만 | 작성자만 | 소프트 삭제, 30일 후 hard purge |
| 공개범위 변경 | 작성자만 | 작성자만 | |
| 초대자 추가 | — | 작성자만 | PRIVATE에서만 |

---

## 9. UX 가이드라인

### 9-1. Reader 페이지 (`docs.<사내>/d/<slug>`)

- **반응형 우선 모바일**: 16px 이상 본문, 한 줄 글자수 60~75자
- **다크 모드**: `prefers-color-scheme` 자동 + 토글
- **TOC**: 우측(데스크톱) / 상단 접힘(모바일)
- **상단 메타바**: 작성자·수정일·조회수·만료·공개범위 배지
- **액션 버튼**: URL 복사 / 본인 문서일 때 "편집(재업로드)" 노출
- **인쇄·PDF 저장**: CSS `@media print` 규칙

### 9-2. 업로드 페이지 (`docs.<사내>/upload`)

- 드래그앤드롭: `.md`, `.html`, 첨부 이미지
- 즉시 미리보기 → 메타 입력(제목/요약/공개범위/만료) → 슬러그 발급
- 발급 후 "복사" 버튼 강조

### 9-3. 내 문서 목록 (`docs.<사내>/me`)

- 최근 업로드·조회수 순 정렬
- 인라인 액션: 보기 / 편집(재업로드) / 공개범위 변경 / 삭제

---

## 10. 기술 스택

| 항목 | 선택 | 비고 |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | |
| Styling | Tailwind CSS | |
| 인증 | NextAuth.js + Google Provider (`hd` 강제) | |
| ORM | Prisma | |
| DB | PostgreSQL (Supabase or Railway) | |
| 스토리지 | Supabase Storage 또는 S3 | signed URL 사용 |
| MD 파서 | `react-markdown` + `remark-gfm` + `rehype-raw` | |
| HTML sanitize | `DOMPurify` (서버) + sandbox iframe (클라) | 이중 방어 |
| 다이어그램 | `mermaid.js` | 코드블럭 `mermaid` 자동 감지 |
| 코드 하이라이트 | `shiki` 또는 `rehype-pretty-code` | |
| Slug | `nanoid(7)` | |
| 배포 | Vercel (또는 Cloudflare Pages) | 두 도메인 모두 같은 배포에 매핑 |
| 모니터링 | Sentry + Vercel Analytics | |

---

## 11. 환경 변수

```env
# Auth
NEXTAUTH_URL=https://docs.<사내>.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ALLOWED_HD=<회사도메인>.com         # Google Hosted Domain 강제

# 도메인
APP_DOMAIN=docs.<사내>.com
CONTENT_DOMAIN=content.<사내>.com

# DB / Storage
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...

# 제한
MAX_UPLOAD_SIZE_MB=10
RATE_LIMIT_UPLOAD_PER_MIN=10
DEFAULT_EXPIRE_DAYS=                # 빈 값=무기한
```

---

## 12. 단계별 로드맵

| Phase | 기간 | 산출물 |
|---|---|---|
| **P1. 인증·스켈레톤** | 2일 | Next.js 신규 앱 + Google Workspace SSO + DB 스키마 |
| **P2. MD MVP** | 2일 | 업로드 → MD 렌더링 → 짧은 URL → 모바일 반응형 |
| **P3. HTML 격리 렌더링** | 3일 | `content.<사내>` 도메인 분리 + sandbox iframe + CSP |
| **P4. 편집·버전·삭제** | 2일 | 작성자 재업로드(버전 보관), 공개범위 변경, 소프트 삭제 |
| **P5. 자산·다이어그램** | 2일 | 이미지 첨부, mermaid, 코드 하이라이트 |
| **P6. 운영·감사 로그** | 2일 | 만료·조회수·DocView 로그·내 문서 목록 |
| **P7+. 차후 features** | — | Slack unfurl / 슬래시 커맨드 / 검색·태그 / 즐겨찾기 |

핵심 P1~P6: **약 13일 (≈ 2.5주)** 1인 기준.

---

## 13. 마이그레이션·운영

- **콘텐츠 보존**: 원본 파일은 Storage에 그대로, DB는 메타만 — 재렌더링은 항상 원본 기준
- **버전 관리**: 작성자가 재업로드하면 `DocVersion` 에 이전 버전 적재, slug는 유지
- **백업**: Storage 일별 스냅샷, DB는 PG 자동 백업
- **삭제**: 소프트 삭제 → 30일 후 Storage hard purge (배치 잡)
- **감사 로그**: `DocView` 에 viewerId·시각·UA 적재 — 민감 문서 추적용
- **속도 제한**: 업로드 RPM·파일 크기(10MB) 제한

---

## 14. 차후 Features (Out of MVP)

우선순위 낮은 항목으로 별도 백로그 관리:

- **Slack 통합**: `link_shared` unfurl → 카드 미리보기, `/docs` 검색 슬래시 커맨드
- **검색·태그**: 제목/요약 검색, 태그 필터, 즐겨찾기
- **Git 동기화**: 사내 GitHub 리포 webhook → 자동 게시 (현재 범위 외)
- **댓글·반응**: 문서별 코멘트, 이모지 리액션
- **외부 공유**: 사내 외 게스트용 만료성 토큰 링크

---

## 15. 다음 단계

본 v1.0 확정 후 다음을 진행:

1. 새 리포지토리 생성 (예: `<org>/internal-docs`)
2. `docs.<사내>.com` / `content.<사내>.com` DNS·SSL 셋업
3. Google Cloud Console에서 OAuth 클라이언트 발급 (`hd` 제한)
4. P1 (인증·스켈레톤) 착수 → WORKLOG 시작
