import { Pipe, PipeTransform } from '@angular/core';
import { RequestStatus } from '@models/request.model';
import { UserStatus } from '@models/user.model';

type Status = RequestStatus | UserStatus;
type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const STATUS_SEVERITY: Record<Status, Severity> = {
  // Request
  new: 'danger',
  in_progress: 'warn',
  done: 'success',
  rejected: 'secondary',
  // User
  pending: 'warn',
  active: 'success',
};

@Pipe({
  name: 'statusSeverity',
})
export class StatusSeverityPipe implements PipeTransform {
  transform(status: Status): Severity {
    return STATUS_SEVERITY[status] || 'secondary';
  }
}
