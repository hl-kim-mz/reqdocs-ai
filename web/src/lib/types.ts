export type DocType = 'prd' | 'feature_list' | 'feature_spec' | 'api_spec' | 'erd';

export type RequirementCategory = '기능 요구사항' | '비기능 요구사항' | '제약사항';
export type MoSCoWPriority = 'Must Have' | 'Should Have' | 'Could Have' | "Won't Have";

export interface StructuredRequirement {
  id: string;
  category: RequirementCategory;
  title: string;
  description: string;
  priority: MoSCoWPriority;
  source?: string;
  order: number;
}

export interface StructureResult {
  projectId: string;
  domain: string;
  purpose: string;
  requirements: StructuredRequirement[];
}

export interface Document {
  type: DocType;
  content: string;
  generatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  rawInput: string;
  documents: Record<DocType, Document | null>;
  createdAt: string;
}

export type GenerationStep = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

export type SelectedDocs = Record<DocType, boolean>;
