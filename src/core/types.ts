export interface ScoredCategory {
  score: number;
  reasoning: string;
}

export interface CVReview {
  overall_structure: ScoredCategory;
  content_quality: ScoredCategory;
  skills_presentation: ScoredCategory;
  experience_highlights: ScoredCategory;
  overall_score: ScoredCategory;
  improvement_suggestions: string[];
}
