import DOMPurify from "isomorphic-dompurify";

// HTML 입력을 가장 안전한 화이트리스트로 정화.
// 추후 P3에서 별도 콘텐츠 도메인 + sandbox iframe 로 격리 전까지
// MD 안에 섞인 인라인 HTML 차단 용도로 우선 사용한다.
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "link", "meta"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  });
}
