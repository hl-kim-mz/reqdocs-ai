'use client';

import { create } from 'zustand';
import type { Project, GenerationStep, DocType, Document } from '@/lib/types';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isGenerating: boolean;
  generationSteps: GenerationStep[];
  streamText: Record<DocType, string>;

  createProject: (title: string, rawInput: string) => string;
  setCurrentProject: (projectId: string | null) => void;
  updateDocument: (
    projectId: string,
    docType: DocType,
    content: string
  ) => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationSteps: (steps: GenerationStep[]) => void;
  updateStep: (stepId: string, status: GenerationStep['status']) => void;
  appendStream: (docType: DocType, token: string) => void;
  clearStream: () => void;
  getProject: (projectId: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isGenerating: false,
  generationSteps: [],
  streamText: {
    prd: '',
    feature_list: '',
    feature_spec: '',
    api_spec: '',
    erd: '',
  },

  createProject: (title: string, rawInput: string) => {
    const projectId = Date.now().toString();
    const newProject: Project = {
      id: projectId,
      title,
      rawInput,
      documents: {
        prd: null,
        feature_list: null,
        feature_spec: null,
        api_spec: null,
        erd: null,
      },
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      currentProject: newProject,
    }));

    return projectId;
  },

  setCurrentProject: (projectId: string | null) => {
    set((state) => ({
      currentProject: projectId
        ? state.projects.find((p) => p.id === projectId) || null
        : null,
    }));
  },

  updateDocument: (projectId: string, docType: DocType, content: string) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const doc: Document = {
            type: docType,
            content,
            generatedAt: new Date().toISOString(),
          };
          return {
            ...p,
            documents: {
              ...p.documents,
              [docType]: doc,
            },
          };
        }
        return p;
      }),
      currentProject:
        state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              documents: {
                ...state.currentProject.documents,
                [docType]: {
                  type: docType,
                  content,
                  generatedAt: new Date().toISOString(),
                },
              },
            }
          : state.currentProject,
    }));
  },

  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setGenerationSteps: (steps: GenerationStep[]) => {
    set({ generationSteps: steps });
  },

  updateStep: (stepId: string, status: GenerationStep['status']) => {
    set((state) => ({
      generationSteps: state.generationSteps.map((step) =>
        step.id === stepId ? { ...step, status } : step
      ),
    }));
  },

  appendStream: (docType: DocType, token: string) => {
    set((state) => ({
      streamText: {
        ...state.streamText,
        [docType]: state.streamText[docType] + token,
      },
    }));
  },

  clearStream: () => {
    set({
      streamText: {
        prd: '',
        feature_list: '',
        feature_spec: '',
        api_spec: '',
        erd: '',
      },
    });
  },

  getProject: (projectId: string) => {
    return get().projects.find((p) => p.id === projectId);
  },
}));
