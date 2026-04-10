export function getStructurePrompt(rawInput: string): string {
  return `당신은 서비스 기획 전문가입니다. 다음 비정형 입력(회의록, 이메일, 기획 메모 등)을 분석하여 구조화된 요구사항 목록을 JSON 형식으로 출력하세요.

입력:
${rawInput}

다음 JSON 형식으로만 출력하세요. JSON 외의 텍스트는 절대 포함하지 마세요:

{
  "domain": "서비스 도메인 (예: 이커머스, 사내 CRM)",
  "purpose": "서비스 목적 한 줄 요약",
  "requirements": [
    {
      "id": "REQ-001",
      "category": "기능 요구사항",
      "title": "요구사항 제목 (간결하게, 20자 이내)",
      "description": "구체적인 설명 (조건, 예외 포함, 100자 이내)",
      "priority": "Must Have",
      "source": "원문에서 근거 문장 (없으면 null)"
    }
  ]
}

규칙:
- category는 반드시 '기능 요구사항', '비기능 요구사항', '제약사항' 중 하나
- priority는 반드시 'Must Have', 'Should Have', 'Could Have', "Won't Have" 중 하나
- id는 REQ-001 형식으로 순번 부여
- 최소 5개 이상, 최대 30개 이하로 요구사항 추출
- 원문에 언급된 내용만 추출 (임의 추가 금지)
- 기능 요구사항 우선 추출, 비기능/제약은 명시적 언급 시에만 포함`;
}

export function getPRDPrompt(rawInput: string): string {
  return `당신은 제품 기획 전문가입니다. 다음 요구사항을 바탕으로 상세한 제품 요구사항 문서(PRD)를 작성하세요.

요구사항:
${rawInput}

다음 구조로 PRD를 작성하세요:

## 개요
- 제품 이름 및 한 줄 설명

## 목표
- 비즈니스 목표 (3-5개)
- 사용자 목표

## 핵심 기능
- 주요 기능 목록 (bullet points)

## 사용자 시나리오
### 주요 사용자 유형
### 주요 시나리오

## 범위
- In-Scope (포함 범위)
- Out-of-Scope (제외 범위)

## 제약사항
- 기술적 제약
- 비즈니스 제약

마크다운 형식으로 작성하세요.`;
}

export function getFeatureListPrompt(rawInput: string): string {
  return `당신은 제품 관리 전문가입니다. 다음 요구사항을 바탕으로 기능 목록을 작성하세요.

요구사항:
${rawInput}

기능 목록을 다음 형식의 마크다운 테이블로 작성하세요:

| 우선순위 | 기능명 | 설명 | 예상 난이도 | 사용자 가치 |
|---------|--------|------|-----------|-----------|
| Must | 기능명 | 상세 설명 | Low/Medium/High | High/Medium/Low |

MoSCoW 방식 우선순위:
- Must: 반드시 필요한 기능
- Should: 중요한 기능
- Could: 좋으면 좋은 기능
- Won't: 이번 버전에서 제외할 기능

최소 10개 이상의 기능을 나열하고, 각 기능의 설명은 명확하고 구체적으로 작성하세요.

마크다운 테이블 형식으로만 작성하세요.`;
}

export function getFeatureSpecPrompt(rawInput: string): string {
  return `당신은 소프트웨어 설계 전문가입니다. 다음 요구사항을 바탕으로 상세한 기능 명세서를 작성하세요.

요구사항:
${rawInput}

각 주요 기능에 대해 다음 구조로 명세를 작성하세요:

## 기능명

### 개요
- 기능 목적 및 요약

### 사용자 스토리
As a [사용자 유형], I want to [목표], so that [이유].

### 입력 / 출력
| 항목 | 설명 | 타입 | 필수 여부 |
|------|------|------|---------|
| ... | ... | ... | ... |

### 처리 흐름
1. 단계별 처리 순서

### 예외 처리
- 에러 케이스 및 처리 방법

### 검증 조건 (Acceptance Criteria)
- [ ] 조건 1
- [ ] 조건 2

---

최소 5개 이상의 핵심 기능에 대해 위 형식으로 작성하세요.
마크다운 형식으로 작성하세요.`;
}

export function getAPISpecPrompt(rawInput: string): string {
  return `당신은 백엔드 API 설계 전문가입니다. 다음 요구사항을 바탕으로 REST API 명세서를 작성하세요.

요구사항:
${rawInput}

다음 구조로 API 명세를 작성하세요:

## API 개요
- Base URL, 인증 방식, 응답 형식

## 공통 규칙
- 요청/응답 헤더, 에러 코드 규약

## 엔드포인트 목록

각 엔드포인트에 대해:

### [METHOD] /endpoint/path
**설명**: 기능 설명

**요청**
\`\`\`json
{
  "field": "type — 설명"
}
\`\`\`

**응답 (200 OK)**
\`\`\`json
{
  "field": "type — 설명"
}
\`\`\`

**에러 응답**
| 상태코드 | 설명 |
|---------|------|
| 400 | ... |
| 401 | ... |

---

도메인별로 그룹화하고, 최소 10개 이상의 엔드포인트를 포함하세요.
마크다운 형식으로 작성하세요.`;
}

export function getERDPrompt(rawInput: string): string {
  return `당신은 데이터베이스 설계 전문가입니다. 다음 요구사항을 바탕으로 ERD를 Mermaid 다이어그램으로 작성하세요.

요구사항:
${rawInput}

다음 형식으로 출력하세요:

## ERD 설명
주요 엔티티와 관계에 대한 간략한 설명 (3-5문장)

## 엔티티 목록
각 테이블의 주요 컬럼과 역할 설명

| 테이블명 | 설명 | 주요 컬럼 |
|---------|------|---------|
| ... | ... | ... |

## ERD 다이어그램

\`\`\`mermaid
erDiagram
    ENTITY1 {
        int id PK
        string field1
        string field2
        datetime created_at
    }
    ENTITY2 {
        int id PK
        int entity1_id FK
        string field1
    }
    ENTITY1 ||--o{ ENTITY2 : "has"
\`\`\`

## 관계 설명
- 각 엔티티 간 관계의 의미와 카디널리티 설명

관계 표기법: ||--o{ (one-to-many), }|--|{ (many-to-many), ||--|| (one-to-one)
마크다운 형식으로 작성하세요.`;
}
