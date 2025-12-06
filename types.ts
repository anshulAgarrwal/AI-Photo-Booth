export type StyleCategory = 'historical' | 'professional';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  imagePlaceholder: string;
  category: StyleCategory;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface GenerationStep {
  id: string;
  image: string; // Base64
  description: string;
}

export interface GeneratedImage {
  originalImage: string; // Base64
  selectedStepId: string | 'original'; // 'original' or UUID of a step
  style: StyleOption;
  steps: GenerationStep[];
}

export interface AnalysisResult {
  text: string;
  isLoading: boolean;
}