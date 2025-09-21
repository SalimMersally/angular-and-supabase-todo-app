import { TodoPriority } from '../todo.model';

export interface SupabaseTodo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: TodoPriority;
  is_completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}
