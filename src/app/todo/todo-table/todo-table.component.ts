import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { Todo, TodoPriority } from '../todo.model';
import { TodoService } from '../service/todo.service';
import { PaginationParams, PaginatedResponse } from '../service/pagination.model';
import { AddTodoComponent } from '../add-todo/add-todo.component';
import { DeleteTodoComponent } from '../delete-todo/delete-todo.component';
import { EditTodoComponent } from '../edit-todo/edit-todo.component';

type TableRow = { isLoading: true; index: number } | (Todo & { isLoading: false });

@Component({
  selector: 'app-todo-table',
  templateUrl: './todo-table.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    CheckboxModule,
    TooltipModule,
    ButtonModule,
    SkeletonModule,
    PaginatorModule,
    AddTodoComponent,
    DeleteTodoComponent,
    EditTodoComponent,
  ],
})
export class TodoTableComponent implements OnInit {
  private todoService = inject(TodoService);
  private messageService = inject(MessageService);

  todos = signal<Todo[]>([]);
  loading = signal<boolean>(false);

  // Pagination state
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);

  // Sort state
  sortField = signal<string | undefined>(undefined);
  sortOrder = signal<'asc' | 'desc' | undefined>(undefined);

  tableData = computed((): TableRow[] => {
    if (this.loading()) {
      return Array(this.pageSize())
        .fill(null)
        .map((_, index) => ({ isLoading: true as const, index }));
    }
    return this.todos().map((todo) => ({ ...todo, isLoading: false as const }));
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading.set(true);

    const paginationParams: PaginationParams = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.todoService.getPaginatedTodos(paginationParams).subscribe({
      next: (response: PaginatedResponse<Todo>) => {
        this.todos.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load todos',
          life: 2000,
        });
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1); // PrimeNG paginator is 0-based
    this.pageSize.set(event.rows);
    this.loadTodos();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'asc' : event.order === -1 ? 'desc' : undefined);
    this.currentPage.set(1); // Reset to first page when sorting
    this.loadTodos();
  }

  onDueDateSort(): void {
    const currentField = this.sortField();
    const currentOrder = this.sortOrder();

    if (currentField === 'due_date') {
      // Toggle between asc -> desc -> no sort
      if (currentOrder === 'asc') {
        this.sortOrder.set('desc');
      } else if (currentOrder === 'desc') {
        this.sortField.set(undefined);
        this.sortOrder.set(undefined);
      } else {
        this.sortOrder.set('asc');
      }
    } else {
      // First click on due date column
      this.sortField.set('due_date');
      this.sortOrder.set('asc');
    }

    this.currentPage.set(1); // Reset to first page when sorting
    this.loadTodos();
  }

  getPrioritySeverity(priority: TodoPriority): 'danger' | 'warn' | 'success' {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warn';
      case 'low':
        return 'success';
      default:
        return 'success';
    }
  }

  getPriorityIcon(priority: TodoPriority): string {
    switch (priority) {
      case 'high':
        return 'pi pi-exclamation-triangle';
      case 'medium':
        return 'pi pi-info-circle';
      case 'low':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-check-circle';
    }
  }

  onStatusChange(todo: Todo): void {
    this.todoService.updateTodoStatus(todo.id, todo.isCompleted).subscribe({
      next: (updatedTodo) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Todo "${updatedTodo.title}" marked as ${
            updatedTodo.isCompleted ? 'completed' : 'pending'
          }`,
          life: 2000,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update todo status',
          life: 2000,
        });
        todo.isCompleted = !todo.isCompleted;
      },
    });
  }
}
