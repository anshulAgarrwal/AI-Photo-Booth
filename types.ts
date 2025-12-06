export interface HistoricalEra {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  imagePlaceholder: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  originalImage: string; // Base64
  currentImage: string; // Base64
  era: HistoricalEra;
  history: string[]; // History of prompt modifications
}

export interface AnalysisResult {
  text: string;
  isLoading: boolean;
}