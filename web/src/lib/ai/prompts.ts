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
