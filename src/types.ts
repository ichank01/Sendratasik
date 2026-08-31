export type Role = 'admin' | 'participant';

export type Difficulty = 'Mudah' | 'Sedang' | 'Sulit';
export type QuestionStatus = 'Draft' | 'Reviewed' | 'Approved' | 'Inactive';
export type AttemptStatus = 'in_progress' | 'completed' | 'reset';
export type FitCategory = 'Sangat Sesuai' | 'Sesuai' | 'Perlu Pengembangan';

export interface User {
  id: string;
  username: string;
  role: Role;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  user_id: string;
  nisn: string;
  name: string;
  class_grade: string;
  major: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email: string;
  primary_choice: string;
  alternative_choice: string;
  motivation: string;
  created_at: string;
  updated_at: string;
}

export interface Competency {
  id: string;
  code: string;
  name: string;
  weight: number; // e.g. 12 for 12%
  description: string;
  indicators: string[];
  created_at: string;
}

export interface PositionProfile {
  id: string;
  position_name: string;
  code: string;
  description: string;
  priority_weights: Record<string, number>; // competency_code -> weight percentage (sum = 100)
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  weight: number; // 1 to 5
}

export interface Question {
  id: string;
  category_id?: string;
  competency_id: string;
  competency_code?: string;
  competency_name?: string;
  question_text: string;
  options: {
    A: { text: string; weight: number };
    B: { text: string; weight: number };
    C: { text: string; weight: number };
    D: { text: string; weight: number };
    E: { text: string; weight: number };
  };
  status: QuestionStatus;
  difficulty: Difficulty;
  indicator: string;
  explanation: string;
  is_sample: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamSettings {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  autosave_enabled: boolean;
  show_participant_score: boolean;
  show_participant_rank: boolean;
  show_competency_profile: boolean;
  show_position_recommendation: boolean;
  allow_view_answers: boolean;
  one_active_attempt: boolean;
  activity_monitoring_enabled: boolean;
  difficulty_distribution: {
    easy_percent: number; // 20
    medium_percent: number; // 50
    hard_percent: number; // 30
  };
  thresholds: {
    sangat_sesuai: number; // 85
    sesuai: number; // 75
  };
  is_active: boolean;
  updated_at: string;
}

export interface ExamBlueprint {
  id: string;
  exam_id: string;
  competency_id: string;
  target_count: number;
}

export interface AttemptQuestionSnapshot {
  question_id: string;
  order_index: number;
  competency_id: string;
  competency_name: string;
  question_text: string;
  difficulty: Difficulty;
  options: Array<{
    display_key: 'A' | 'B' | 'C' | 'D' | 'E';
    original_key: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    // Note: weight is hidden from participant client payload
    weight?: number;
  }>;
}

export interface Attempt {
  id: string;
  exam_id: string;
  participant_id: string;
  participant_name?: string;
  participant_nisn?: string;
  participant_class?: string;
  status: AttemptStatus;
  started_at: string;
  expires_at: string;
  finished_at?: string;
  raw_score?: number;
  max_score?: number;
  final_score?: number;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  refresh_count: number;
  reconnect_count: number;
  reset_reason?: string;
  reset_by?: string;
  reset_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_display_key: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  selected_original_key: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  selected_weight: number;
  is_doubtful: boolean;
  answered_at: string;
  updated_at: string;
}

export interface CompetencyScore {
  competency_id: string;
  competency_code: string;
  competency_name: string;
  raw_score: number;
  max_score: number;
  normalized_score: number; // 0 - 100
}

export interface PositionScore {
  position_id: string;
  position_name: string;
  code: string;
  match_percentage: number; // 0 - 100
  fit_category: FitCategory;
}

export interface AttemptResult {
  attempt: Attempt;
  participant: Participant;
  final_score: number;
  raw_score: number;
  max_score: number;
  total_questions: number;
  answered_questions: number;
  rank?: number;
  total_participants?: number;
  competency_scores: CompetencyScore[];
  position_scores: PositionScore[];
  strengths: CompetencyScore[];
  areas_for_development: CompetencyScore[];
  top_recommended_position?: PositionScore;
  recommended_positions: PositionScore[];
  admin_note?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  participant_id?: string;
  user_name?: string;
  action_type: string;
  description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminNote {
  id: string;
  participant_id: string;
  note_text: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_participants: number;
  completed_exams: number;
  in_progress_exams: number;
  not_started: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  competency_averages: Array<{
    code: string;
    name: string;
    average: number;
  }>;
  top_candidates_per_position: Array<{
    position_name: string;
    candidate_name: string;
    nisn: string;
    class_grade: string;
    match_percentage: number;
    final_score: number;
  }>;
}
