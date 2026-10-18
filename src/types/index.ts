export interface MediaIdentity {
  mediaTitle: string;
  subject: string;
  grade: string;
  phase: string;
  topic: string;
  school: string;
  teacherName: string;
  passingScore: number; // KKM / KKTP misal 75
}

export interface StudentSession {
  sessionId: string;
  studentName: string;
  studentClass: string;
  studentNumber: string;
  startTime: string;
  submittedLoginToSheet: boolean;
}

export interface MateriInteractiveActivity {
  type: 'hotspot' | 'matching' | 'ordering' | 'checklist';
  title: string;
  instruction: string;
  data: any;
}

export interface MateriSlide {
  id: number;
  title: string;
  subtitle: string;
  concept: string;
  content: string[];
  illustrationType: 'water-cycle' | 'clouds' | 'groundwater' | 'conservation' | 'summary';
  funFact?: string;
  activity?: MateriInteractiveActivity;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizSubmission {
  sessionId: string;
  timestamp: string;
  studentName: string;
  studentClass: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  status: 'TUNTAS' | 'PERLU BIMBINGAN';
  answers: { questionId: number; selectedAnswer: number; isCorrect: boolean }[];
}

export interface ReflectionSubmission {
  sessionId: string;
  timestamp: string;
  studentName: string;
  studentClass: string;
  understandingLevel: string; // 'Sangat Paham' | 'Paham' | 'Cukup Paham' | 'Belum Paham'
  confidenceRating: number; // 1 - 5
  favoriteActivity: string;
  difficultPart: string;
  additionalNotes: string;
}

export type ViewStage = 'opening' | 'tujuan' | 'materi' | 'latihan' | 'refleksi' | 'selesai';

export interface AppConfig {
  identity: MediaIdentity;
  scriptUrl: string; // Google Apps Script Web App URL
  enableSoundEffects: boolean;
  enableBgm: boolean;
}
