import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Todo } from '../todo.model';
import { AddTodoRequest } from './add-todo-request.model';
import { SupabaseTodo } from './supabase-todo.model';
import { PaginationParams, PaginatedResponse } from './pagination.model';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { TodoMappingService } from './todo-mapping.service';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private supabase = inject(SupabaseService);
  private authService = inject(AuthService);
  private mappingService = inject(TodoMappingService);

  getPaginatedTodos(params: PaginationParams): Observable<PaginatedResponse<Todo>> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = fromIndex + params.pageSize - 1;

    let query = this.supabase.client
      .from('todos')
      .select('*', { count: 'exact' })
      .eq('user_id', currentUser.id);

    // Apply sorting
    if (params.sortField && params.sortOrder) {
      const ascending = params.sortOrder === 'asc';
      query = query.order(params.sortField, { ascending });
    } else {
      // Default sort by created_at descending
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(fromIndex, toIndex);

    return from(query).pipe(
      map(({ data, error, count }) => {
        if (error) {
          throw error;
        }

        const todos = (data as SupabaseTodo[]).map((todo) =>
          this.mappingService.mapSupabaseTodoToTodo(todo)
        );

        const total = count || 0;
        const totalPages = Math.ceil(total / params.pageSize);

        return {
          data: todos,
          total,
          page: params.page,
          pageSize: params.pageSize,
          totalPages,
        };
      }),
      catchError((error) => {
        console.error('Error fetching paginated todos:', error);
        return throwError(() => error);
      })
    );
  }

  addTodo(request: AddTodoRequest): Observable<Todo> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const newTodoData = this.mappingService.createSupabaseTodoInsert(request, currentUser.id);

    return from(this.supabase.client.from('todos').insert(newTodoData).select().single()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return this.mappingService.mapSupabaseTodoToTodo(data as SupabaseTodo);
      }),
      catchError((error) => {
        console.error('Error adding todo:', error);
        return throwError(() => error);
      })
    );
  }

  updateTodoStatus(id: string, isCompleted: boolean): Observable<Todo> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client
        .from('todos')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return this.mappingService.mapSupabaseTodoToTodo(data as SupabaseTodo);
      }),
      catchError((error) => {
        console.error('Error updating todo status:', error);
        return throwError(() => error);
      })
    );
  }

  deleteTodo(id: string): Observable<void> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client.from('todos').delete().eq('id', id).eq('user_id', currentUser.id)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
      catchError((error) => {
        console.error('Error deleting todo:', error);
        return throwError(() => error);
      })
    );
  }

  getTodoById(id: string): Observable<Todo> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return this.mappingService.mapSupabaseTodoToTodo(data as SupabaseTodo);
      }),
      catchError((error) => {
        console.error('Error fetching todo by id:', error);
        return throwError(() => error);
      })
    );
  }

  updateTodo(updatedTodo: Todo): Observable<Todo> {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const updateData = this.mappingService.createSupabaseTodoUpdate(updatedTodo);

    return from(
      this.supabase.client
        .from('todos')
        .update(updateData)
        .eq('id', updatedTodo.id)
        .eq('user_id', currentUser.id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return this.mappingService.mapSupabaseTodoToTodo(data as SupabaseTodo);
      }),
      catchError((error) => {
        console.error('Error updating todo:', error);
        return throwError(() => error);
      })
    );
  }
}
