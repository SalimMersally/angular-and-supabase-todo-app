import { Injectable } from '@angular/core';
import { Todo } from '../todo.model';
import { AddTodoRequest } from './add-todo-request.model';
import { SupabaseTodo } from './supabase-todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoMappingService {
  mapSupabaseTodoToTodo(supabaseTodo: SupabaseTodo): Todo {
    return {
      id: supabaseTodo.id,
      title: supabaseTodo.title,
      description: supabaseTodo.description,
      dueDate: new Date(supabaseTodo.due_date),
      priority: supabaseTodo.priority,
      isCompleted: supabaseTodo.is_completed,
      userId: supabaseTodo.user_id,
      createdAt: new Date(supabaseTodo.created_at),
      updatedAt: new Date(supabaseTodo.updated_at),
    };
  }

  createSupabaseTodoInsert(
    todo: AddTodoRequest,
    userId: string
  ): Omit<SupabaseTodo, 'id' | 'created_at' | 'updated_at'> {
    return {
      title: todo.title,
      description: todo.description,
      due_date: todo.dueDate.toISOString(),
      priority: todo.priority,
      is_completed: false,
      user_id: userId,
    };
  }

  createSupabaseTodoUpdate(todo: Todo): Omit<SupabaseTodo, 'id' | 'user_id' | 'created_at'> {
    return {
      title: todo.title,
      description: todo.description,
      due_date: todo.dueDate.toISOString(),
      priority: todo.priority,
      is_completed: todo.isCompleted,
      updated_at: new Date().toISOString(),
    };
  }
}
