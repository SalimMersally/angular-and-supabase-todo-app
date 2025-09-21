import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TodoService } from '../service/todo.service';

@Component({
  selector: 'app-delete-todo',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, TooltipModule],
  providers: [ConfirmationService],
  templateUrl: './delete-todo.component.html',
})
export class DeleteTodoComponent {
  @Input({ required: true }) todoId!: string;
  @Input({ required: true }) todoTitle!: string;
  @Output() todoDeleted = new EventEmitter<void>();

  private todoService = inject(TodoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  deleting = signal(false);

  deleteTodo() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this todo?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleting.set(true);
        this.todoService.deleteTodo(this.todoId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Todo "${this.todoTitle}" deleted successfully!`,
            });
            this.todoDeleted.emit();
            this.deleting.set(false);
          },
          error: (error: any) => {
            console.error('Error deleting todo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete todo. Please try again.',
            });
            this.deleting.set(false);
          },
        });
      },
    });
  }
}
