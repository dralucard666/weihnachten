import type {
  Answer,
  QuestionType,
  CustomAnswer,
  PlayerAnswerInfo,
  QuestionMedia,
  OrderItem,
} from "../../../../../shared/types";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  orderItems?: OrderItem[];
  correctOrder?: string[];
  media?: QuestionMedia;
}
