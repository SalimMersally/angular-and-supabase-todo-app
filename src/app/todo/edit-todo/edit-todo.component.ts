import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { Todo, TodoPriority } from '../todo.model';
import { TodoService } from '../service/todo.service';

@Component({
  selector: 'app-edit-todo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    TooltipModule,
    SkeletonModule,
  ],
  templateUrl: './edit-todo.component.html',
})
export class EditTodoComponent {
  @Input({ required: true }) todoId!: string;
  @Output() todoUpdated = new EventEmitter<void>();

  private todoService = inject(TodoService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  visible = signal(false);
  saving = signal(false);
  loading = signal(false);
  todoForm: FormGroup;
  originalFormValue: any = null;
  todo: Todo | null = null;

  priorityOptions = [
    { label: 'Low', value: 'low' as TodoPriority },
    { label: 'Medium', value: 'medium' as TodoPriority },
    { label: 'High', value: 'high' as TodoPriority },
  ];

  constructor() {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      dueDate: [null, Validators.required],
      priority: ['low', Validators.required],
    });
  }

  openModal() {
    this.visible.set(true);
    this.loading.set(true);
    this.loadTodo();
  }

  hide() {
    this.visible.set(false);
    this.resetForm();
  }

  private loadTodo() {
    this.todoService.getTodoById(this.todoId).subscribe({
      next: (todo: Todo) => {
        this.todo = todo;
        this.prefillForm(todo);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading todo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load todo. Please try again.',
        });
        this.loading.set(false);
      },
    });
  }

  private prefillForm(todo: Todo) {
    const formValue = {
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      priority: todo.priority,
    };

    this.todoForm.patchValue(formValue);
    this.originalFormValue = { ...formValue };
  }

  private resetForm() {
    if (this.todo) {
      this.prefillForm(this.todo);
    }
  }

  onSave() {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    if (!this.hasFormChanged()) {
      this.hide();
      return;
    }

    this.saving.set(true);

    const updatedTodo: Todo = {
      ...this.todo!,
      ...this.todoForm.value,
    };

    this.todoService.updateTodo(updatedTodo).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Todo "${updatedTodo.title}" updated successfully!`,
        });
        this.todoUpdated.emit();
        this.hide();
        this.saving.set(false);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update todo. Please try again.',
        });
        this.saving.set(false);
      },
    });
  }

  hasFormChanged(): boolean {
    if (!this.originalFormValue) return false;

    const currentValue = this.todoForm.value;
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
  }

  get title() {
    return this.todoForm.get('title');
  }

  get description() {
    return this.todoForm.get('description');
  }

  get dueDate() {
    return this.todoForm.get('dueDate');
  }

  get priority() {
    return this.todoForm.get('priority');
  }
}
