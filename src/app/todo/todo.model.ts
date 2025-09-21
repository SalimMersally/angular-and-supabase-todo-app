export type TodoPriority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TodoPriority;
  isCompleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
