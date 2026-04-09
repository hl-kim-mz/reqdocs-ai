# 컴포넌트 명세 (Component Spec)

> v1.0 | 작성일: 2026-04-09

---

## 1. 컴포넌트 목록

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `AppShell` | 전역 | Topbar + Sidebar + Content 영역 레이아웃 |
| `Sidebar` | 전역 | 프로젝트 네비게이션 (240px ↔ 64px 토글) |
| `Topbar` | 전역 | 로고 + Breadcrumb + 사용자 메뉴 |
| `RequirementsEditor` | `/workspace/new` | 대형 textarea + 글자 수 카운터 |
| `FileDropzone` | `/workspace/new` | 드래그앤드롭 파일 업로드 + 텍스트 추출 |
| `DocumentSelector` | `/workspace/new` | 생성할 문서 종류 체크박스 |
| `GenerationOptions` | `/workspace/new` | 언어/상세도 설정 |
| `TokenEstimator` | `/workspace/new` | API 토큰 예상 비용 표시 |
| `GenerationProgress` | `/workspace/new` (우측 패널) | 단계별 진행 상태 + 스트리밍 미리보기 |
| `DocumentTabBar` | `/workspace/[id]` | 5개 탭 전환 (URL 파라미터 연동) |
| `MarkdownViewer` | PRD / 기능 목록 / 명세서 탭 | Markdown 렌더링 |
| `InlineEditor` | PRD / 기능 목록 / 명세서 탭 | 문서 인라인 편집 (토글 방식) |
| `SidePanel` | `/workspace/[id]` | 문서 정보 + 액션 버튼 (280px 고정) |
| `FeatureCard` | 기능 목록 탭 | 기능 카드 (MoSCoW 태그 + 상세 펼침) |
| `ApiTable` | API 문서 탭 | 엔드포인트 목록 (메서드별 색상) |
| `ApiDetail` | API 문서 탭 | Request/Response 상세 |
| `MermaidRenderer` | ERD 탭 | Mermaid 다이어그램 + 줌/패닝 |
| `MermaidEditor` | ERD 탭 | Mermaid 코드 직접 편집 |
| `ExportMenu` | SidePanel | MD / PDF / DOCX 다운로드 |
| `ProjectCard` | 대시보드 | 프로젝트 카드 (최근 3개) |

---

## 2. 핵심 컴포넌트 상세

---

### AppShell

```
Props: { children: ReactNode }

레이아웃:
  ┌──────────────────────────────────┐
  │  Topbar (64px, sticky)           │
  ├──────────┬───────────────────────┤
  │ Sidebar  │  {children}           │
  │ (240px,  │  (overflow-y: auto)   │
  │  sticky) │                       │
  └──────────┴───────────────────────┘

상태: sidebarCollapsed (boolean, localStorage 저장)
```

---

### RequirementsEditor

```
Props:
  value: string
  onChange: (value: string) => void
  maxLength?: number  // default: 10000
  placeholder?: string
  minHeight?: number  // default: 500 (px)

상태:
  idle | typing | ready (글자 수 > 0)

UI:
  - textarea (resize: vertical)
  - 하단 글자 수 카운터: "{현재} / {max}"
  - maxLength 초과 시 경고 색상
```

---

### FileDropzone

```
Props:
  onParsed: (text: string) => void
  accept?: string[]  // default: ['.txt', '.md', '.pdf', '.docx']
  maxSizeMB?: number // default: 10

상태: idle | dragging | parsing | done | error

동작:
  1. 파일 드롭 or 클릭 업로드
  2. 파싱 중 로딩 스피너
  3. 완료 시 → onParsed(extractedText) 호출
  4. RequirementsEditor의 value에 삽입

파일별 파서:
  .txt / .md → 직접 읽기
  .pdf       → pdf-parse (서버사이드)
  .docx      → mammoth (서버사이드)
```

---

### GenerationProgress

```
Props:
  steps: Step[]          // [{ name, status: 'done'|'active'|'pending' }]
  percent: number        // 0~100
  streamText?: string    // 스트리밍 미리보기 텍스트
  onCancel: () => void

UI:
  - 제목 "⚡ 문서 생성 중..."
  - 진행바 (percent)
  - 단계별 아이콘: ✅ 완료 / 🔄 진행 중 / ⬜ 대기
  - 스트리밍 미리보기 박스 (scrollIntoView 자동)
  - [취소] 버튼
```

---

### DocumentTabBar

```
Props:
  projectId: string
  activeTab: 'prd' | 'features' | 'spec' | 'api' | 'erd'
  availableTabs: string[]  // 생성된 문서만 활성화

탭 목록:
  PRD | 기능 목록 | 기능 명세서 | API 문서 | ERD

동작:
  - 탭 클릭 → URL 변경 (/workspace/[id]/[tab])
  - 미생성 문서 탭: 비활성화 + 툴팁 "생성되지 않은 문서"
```

---

### MermaidRenderer

```
Props:
  diagram: string    // Mermaid 문법 문자열
  onEdit?: (newDiagram: string) => void

기능:
  - mermaid.js로 SVG 렌더링
  - 줌인/줌아웃 버튼
  - 패닝 (드래그)
  - 전체화면 버튼
  - 레이아웃 재정렬 버튼
  - 하단 Mermaid 코드 편집기 (접기/펼치기)

상태: idle | zoom(n) | fullscreen
```

---

### SidePanel

```
Props:
  document: Document
  onEdit: () => void
  onRegenerate: () => void
  onExport: (format: 'md'|'pdf'|'docx') => void

너비: 280px (고정)

섹션:
  1. 📌 문서 정보 (생성일, 버전)
  2. 📊 프로젝트 요약 (엔티티 수, 기능 수, API 수, 테이블 수)
  3. 🛠 액션 버튼 (편집 모드 / 재생성 / 전체 복사 / MD·PDF·DOCX 다운로드)
```

---

## 3. 디자인 토큰

```css
/* 컬러 시스템 */
--color-primary     : #6366f1;  /* Indigo — 브랜드 */
--color-success     : #22c55e;  /* 생성 완료 */
--color-warning     : #f59e0b;  /* 토큰 경고 */
--color-error       : #ef4444;  /* 오류 */
--color-surface     : #ffffff;  /* 배경 */
--color-surface-sub : #f8fafc;  /* 서브 배경 */
--color-border      : #e2e8f0;  /* 테두리 */
--color-text        : #0f172a;  /* 기본 텍스트 */
--color-text-sub    : #64748b;  /* 보조 텍스트 */

/* 문서 타입별 색상 */
--doc-prd      : #818cf8;  /* Indigo */
--doc-features : #34d399;  /* Emerald */
--doc-spec     : #60a5fa;  /* Blue */
--doc-api      : #f472b6;  /* Pink */
--doc-erd      : #fb923c;  /* Orange */

/* HTTP 메서드 색상 */
--method-get    : #3b82f6;  /* Blue */
--method-post   : #22c55e;  /* Green */
--method-put    : #f59e0b;  /* Amber */
--method-delete : #ef4444;  /* Red */

/* 간격 */
--spacing-sidebar    : 240px;
--spacing-sidebar-sm : 64px;
--spacing-topbar     : 64px;
--spacing-side-panel : 280px;
```

---

## 4. 반응형 전략

> 기본 타겟: Desktop (1280px 이상)

| 브레이크포인트 | 레이아웃 변화 |
|----------------|--------------|
| ≥ 1280px | 사이드바 240px, 전체 2-pane 레이아웃 유지 |
| 1024px~1279px | 사이드바 자동 접힘 (64px), 컨텐츠 영역 확장 |
| < 1024px | 사이드바 오버레이 방식, 모바일 대응 (참고용) |

> 모바일 대응은 Post-MVP 범위입니다.
