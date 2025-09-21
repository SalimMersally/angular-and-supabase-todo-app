import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { Todo, TodoPriority } from '../todo.model';
import { AddTodoRequest } from '../service/add-todo-request.model';
import { TodoService } from '../service/todo.service';

@Component({
  selector: 'app-add-todo',
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
  ],
  templateUrl: './add-todo.component.html',
})
export class AddTodoComponent {
  @Output() todoAdded = new EventEmitter<void>();

  private todoService = inject(TodoService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  visible = signal(false);
  saving = signal(false);
  todoForm: FormGroup;

  priorityOptions = [
    { label: 'Low', value: 'low' as TodoPriority },
    { label: 'Medium', value: 'medium' as TodoPriority },
    { label: 'High', value: 'high' as TodoPriority },
  ];

  constructor() {
    this.todoForm = this.fb.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      description: [null, [Validators.required, Validators.minLength(5)]],
      dueDate: [null, Validators.required],
      priority: [null, Validators.required],
    });
  }

  openModal() {
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
    this.resetForm();
  }

  onSave() {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const request: AddTodoRequest = this.todoForm.value;

    this.todoService.addTodo(request).subscribe({
      next: (newTodo) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Todo "${newTodo.title}" created successfully`,
          life: 3000,
        });
        this.todoAdded.emit();
        this.hide();
      },
      error: (error) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create todo. Please try again.',
          life: 3000,
        });
      },
    });
  }

  private resetForm() {
    this.todoForm.reset({
      title: '',
      description: '',
      dueDate: null,
      priority: 'low',
    });
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
