export interface OptionChoice {
  id: string;
  text: string;
  icon?: string;
}

export interface AssessmentQuestion {
  id: string;
  category: 'logic' | 'data' | 'programming' | 'perception';
  question: string;
  options: OptionChoice[];
}

export interface AssessmentResponse {
  phase: 'pretest' | 'posttest';
  item_id: string;
  value: string;
  duration_seconds: number;
}
