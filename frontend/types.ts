
export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
}

export interface TodoCreateRequest {
  title: string;
  description: string;
}

export interface TodoUpdateRequest {
  title: string;
  description: string;
  completed: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';

export interface AIAnalysis {
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  category: string;
  subtasks: string[];
}
