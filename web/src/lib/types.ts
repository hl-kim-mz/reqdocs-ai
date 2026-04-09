export type DocType = 'prd' | 'feature_list' | 'feature_spec' | 'api_spec' | 'erd';

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
