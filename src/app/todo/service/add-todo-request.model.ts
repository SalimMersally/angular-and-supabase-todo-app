import { TodoPriority } from '../todo.model';

export interface AddTodoRequest {
  title: string;
  description: string;
  dueDate: Date;
  priority: TodoPriority;
}
