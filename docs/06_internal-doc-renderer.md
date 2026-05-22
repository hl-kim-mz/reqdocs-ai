# 사내 문서 렌더링 (Internal Doc Renderer)

> v0.1 (Draft) | 작성일: 2026-05-22
> Goal: 사내 HTML/MD 문서를 다운로드 없이 어떤 디바이스에서든 즉시 열람

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
- 사내 인증으로 접근 제어
- HTML/MD 모두 지원 (이미지·다이어그램·코드 블록 포함)

### 1-3. Non-goal

- 외부(고객) 공개용 위키/CMS 대체
- 실시간 협업 편집 (Notion·Confluence 수준)
- 풀텍스트 검색 엔진 (초기 범위 외)

---

## 2. 핵심 시나리오

```
[작성자]                                    [수신자]
  │                                            │
  │ 1. HTML/MD 업로드 (or Git 동기화)         │
  ▼                                            │
[Renderer]──2. 짧은 공유 URL 발급─────────────▶│
  │                                            │ 3. Slack에 URL 붙여넣기
  │                              ┌─────────────┘
  │                              ▼
  │                       Slack unfurl
  │                       (제목·요약·썸네일)
  │                              │
  │                              ▼ (모바일/PC)
  └◀─4. 인증 후 즉시 브라우저 렌더링◀─────────
```

대표 흐름:
1. 작성자가 `docs.<사내도메인>` 에 파일 업로드
2. 시스템이 `docs.<사내도메인>/d/<slug>` 형태 URL 발급
3. Slack 채널에 URL 공유 → unfurl로 제목/미리보기 표시
4. 동료가 모바일 Slack에서 링크 탭 → SSO 인증 → 렌더링된 페이지 표시

---

## 3. 아키텍처 옵션 비교

| 옵션 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A. 기존 ReqDocs AI 안에 모듈 추가 | `/docs/*` 라우트로 통합 | 인증·DB·스토리지 재사용, 운영 단순 | 본 서비스와 결합도 ↑ |
| B. 별도 서비스 (`docs.<도메인>`) | 독립 Next.js 앱 | 책임 분리, 격리 운영 | 인프라·인증 중복 |
| C. Git 기반 정적 사이트 | GitHub Pages / Docusaurus | 가장 단순, 버전관리 자동 | 사내 접근 제어 어려움, 업로드 UX 약함 |
| D. SaaS (Notion/Confluence) 이전 | 외부 도구로 옮김 | 자체 개발 X | 비용·외부 의존, HTML 원본 유지 어려움 |

**권장: 옵션 A (모듈 통합)** — 단기 구축 비용이 가장 낮고, 이미 갖춰진 NextAuth/Prisma/Storage를 재사용. 추후 트래픽/요건 분기 시 B로 분리 가능.

> 🔸 결정 필요: A vs B vs C — 4절의 권장안은 A 가정.

---

## 4. 권장 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT (Any device)                    │
│   Slack 모바일 → 브라우저 → 반응형 Reader UI                │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│              Next.js App Router (기존 reqdocs-ai)            │
│   /docs/upload      업로드/메타입력                          │
│   /docs/d/[slug]    렌더링 페이지 (SSR + 클라 하이라이트)    │
│   /api/docs/*       업로드·메타·권한·Slack unfurl 처리       │
├──────────────────────────────────────────────────────────────┤
│   Auth(NextAuth)  ACL  Sanitize  Rate-limit  Audit log       │
└────┬──────────────────┬─────────────────────┬────────────────┘
     │                  │                     │
┌────▼─────┐    ┌───────▼────────┐    ┌───────▼──────────┐
│ PostgreSQL│    │ Object Storage │    │ Slack Events API │
│ 문서 메타·│    │ 원본 .html/.md │    │ link_shared 처리  │
│ 권한·로그 │    │ 첨부 이미지    │    │ unfurl 응답       │
└──────────┘    └────────────────┘    └──────────────────┘
```

### 4-1. 렌더링 파이프라인

```
[저장된 원본 파일] ── fetch ──▶ [MIME 분기]
        │                          │
        │                ┌─────────┴─────────┐
        │                ▼                   ▼
        │            .md / .mdx          .html
        │                │                   │
        │                ▼                   ▼
        │     remark/rehype 파이프라인   sandbox iframe (srcdoc)
        │     - GFM, table, task list   - allow-same-origin OFF
        │     - mermaid 다이어그램      - CSP: 외부 fetch 제한
        │     - shiki 코드 하이라이트   - 별도 콘텐츠 도메인 사용
        │     - DOMPurify sanitize      
        │                │                   │
        │                └─────────┬─────────┘
        │                          ▼
        └────────────────▶  React 컴포넌트로 렌더 + 목차/공유 메타
```

---

## 5. 보안 모델 (가장 중요)

HTML은 임의의 스크립트를 포함할 수 있어 **반드시** 격리해야 함.

| 위협 | 대응 |
|---|---|
| 업로드된 HTML 내 `<script>` XSS | 별도 콘텐츠 origin(`content.<도메인>`) + sandbox iframe (`allow-same-origin` 제외) |
| Markdown 내 raw HTML/inline JS | rehype-sanitize 또는 DOMPurify 화이트리스트 |
| 외부 도메인 추적/탈취 | CSP `default-src 'none'; img-src ...; style-src 'unsafe-inline'` 등 최소권한 |
| 권한없는 외부 접근 | NextAuth 세션 필수, `Visibility=LINK`도 사내 SSO 통과 후만 허용 |
| 링크 무한 공유 | 만료(expiresAt) + 조회수/감사 로그 |
| 첨부 파일 탈취 | Signed URL (5분) 발급, Storage 직접 노출 금지 |

> 🔸 결정 필요: 콘텐츠 도메인 분리 가능 여부 (DNS·SSL 추가 필요).

---

## 6. 데이터 모델 (Prisma)

```prisma
model SharedDoc {
  id          String     @id @default(cuid())
  slug        String     @unique          // 짧은 공유 URL 식별자 (예: a8x2k)
  ownerId     String
  title       String
  summary     String?                     // Slack unfurl용 1~2줄
  format      DocFormat
  storagePath String                      // S3/Supabase 경로
  visibility  Visibility @default(ORG)
  expiresAt   DateTime?
  views       Int        @default(0)
  owner       User       @relation(fields: [ownerId], references: [id])
  assets      DocAsset[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model DocAsset {
  id          String    @id @default(cuid())
  docId       String
  filename    String
  storagePath String
  mimeType    String
  doc         SharedDoc @relation(fields: [docId], references: [id], onDelete: Cascade)
}

model DocView {
  id        String   @id @default(cuid())
  docId     String
  viewerId  String?
  viewedAt  DateTime @default(now())
  userAgent String?
}

enum DocFormat  { md html }
enum Visibility { ORG LINK PRIVATE }   // ORG=사내 전체, LINK=링크 보유자(SSO통과 필요), PRIVATE=초대된 사람만
```

---

## 7. URL/공유 규약

| 항목 | 규칙 |
|---|---|
| 공유 URL | `https://docs.<사내>/d/<slug>` |
| Slug | 5~7자 base62, 충돌 시 재발급 |
| 짧은 표시 | `docs.<사내>/d/a8x2k` — Slack 한 줄에 깔끔 |
| 만료 | 기본 무기한, 옵션으로 7/30/90일 |
| 비공개 토글 | `/d/<slug>?v=org\|link\|private` (작성자만 가능) |

---

## 8. Slack 통합

- **Phase 1**: URL만 공유 (Slack unfurl 없이도 동작)
- **Phase 2**: Slack App 등록 → `link_shared` 이벤트 수신 → `chat.unfurl` 로 제목·요약·작성자 표시
- **Phase 3 (옵션)**: `/docs` 슬래시 커맨드 — 제목·태그로 사내 문서 검색

```
Slack 이벤트 흐름
  Slack ──link_shared──▶ /api/slack/events
                              │
                              ▼
                       슬러그 추출 → 메타 조회
                              │
                              ▼
                       chat.unfurl 응답 (title/summary/thumbnail)
```

---

## 9. UX 가이드라인

### 9-1. Reader 페이지

- **반응형 우선 모바일**: 16px 이상 본문, 한 줄 글자수 60~75자
- **다크 모드**: `prefers-color-scheme` 자동 + 토글 (이미 `dark-*.html` 토큰 존재)
- **TOC**: 우측(데스크톱) / 상단 접힘(모바일)
- **공유 버튼**: URL 복사, Slack에 즉시 공유
- **메타바**: 작성자·수정일·조회수·만료
- **인쇄/PDF 저장**: 단순 CSS print 규칙

### 9-2. 업로드 페이지

- 드래그앤드롭: `.md`, `.html`, 첨부 이미지 zip
- 미리보기 → 슬러그 발급 → 복사 가능한 URL 카드
- 작성자 메타: 제목/요약/공개범위/만료

---

## 10. 기술 스택 추가 항목

| 항목 | 선택 | 비고 |
|---|---|---|
| MD 파서 | `react-markdown` + `remark-gfm` | 기존 의존성 활용 가능 |
| 다이어그램 | `mermaid.js` | 코드블럭 `mermaid` 자동 감지 |
| 코드 하이라이트 | `shiki` 또는 `rehype-pretty-code` | 빌드 타임 toString |
| HTML sanitize | `DOMPurify` (서버) + sandbox iframe (클라) | 이중 방어 |
| 업로드 | Supabase Storage / S3 + presigned PUT | 기존 인프라 일치 |
| Slug | `nanoid(7)` | 충돌율 무시 가능 |
| Unfurl | `@slack/web-api` | Phase 2부터 |

---

## 11. 단계별 로드맵

| Phase | 기간 | 산출물 |
|---|---|---|
| **P1. MVP** | 3~5일 | 업로드 → MD 렌더링 → 사내 SSO → 짧은 URL → 모바일 반응형 |
| **P2. HTML 격리** | 2~3일 | HTML sandbox iframe + 콘텐츠 도메인 + CSP |
| **P3. Slack unfurl** | 2일 | Slack App + `link_shared` 처리 + 메타 카드 |
| **P4. 자산·첨부** | 2일 | 이미지 zip 업로드, mermaid, 코드 하이라이트 |
| **P5. 운영** | 2일 | 만료·감사 로그·조회수·삭제·공유범위 변경 |
| **P6. 검색/태그** (옵션) | 3~5일 | 태그 필터, 제목/요약 검색, 즐겨찾기 |
| **P7. Git 동기화** (옵션) | 3~5일 | 사내 GitHub 리포 webhook → 자동 게시 |

총 핵심(P1~P5): **약 2주** 1인 기준.

---

## 12. 마이그레이션·운영

- **콘텐츠 보존**: 원본 파일은 Storage에 그대로, DB는 메타만. 재렌더링은 항상 원본 기준
- **백업**: Storage 일별 스냅샷, DB는 기존 정책 따름
- **삭제**: 소프트 삭제(`deletedAt`) + 30일 후 Storage hard purge
- **감사 로그**: 누가/언제/어디서 봤는지 `DocView` 적재 — 민감 문서 추적용
- **속도 제한**: 업로드 RPM·파일 크기 제한 (10MB) — 기존 `RATE_LIMIT_RPM` 패턴 재사용

---

## 13. 열린 결정사항 (Open Questions)

작성 진행에 영향이 큰 순서:

1. **배치 위치** — 기존 ReqDocs AI에 모듈 통합(A) vs 별도 서비스(B)?
2. **인증 방식** — Google Workspace SSO / Okta / 사내 IdP / 이메일+도메인 화이트리스트?
3. **콘텐츠 도메인 분리** — `content.<도메인>` 추가 발급 가능? (HTML 격리 보안의 전제)
4. **문서 원천** — 업로드만? Git 리포 동기화 병행? (P7 우선순위에 영향)
5. **Slack 통합 깊이** — unfurl만? 슬래시 커맨드/검색까지?
6. **데이터 리전** — 국내 보관 의무 있는지? (S3 ap-northeast-2 vs Supabase EU 등)
7. **만료/보관 정책** — 기본 무기한? 90일 강제?

위 항목 확정 후 본 문서를 v1.0으로 승격하고 Phase별 세부 작업(WORKLOG)에 옮긴다.
