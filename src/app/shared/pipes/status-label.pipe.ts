import { Pipe, PipeTransform } from '@angular/core';
import { RequestStatus } from '@models/request.model';
import { UserStatus } from '@models/user.model';

type Status = RequestStatus | UserStatus;

const STATUS_LABELS: Record<Status, string> = {
  // Request statuses
  new: 'Нова',
  in_progress: 'В обробці',
  done: 'Виконано',
  rejected: 'Відхилено',
  // User statuses
  pending: 'Очікує',
  active: 'Активний',
};

@Pipe({
  name: 'statusLabel',
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: Status): string {
    return STATUS_LABELS[status] || status;
  }
}
