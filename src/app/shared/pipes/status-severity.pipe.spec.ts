import { RequestStatus } from '@models/request.model';
import { StatusSeverityPipe } from '@shared/pipes/status-severity.pipe';
import { UserStatus } from '@models/user.model';

describe('StatusSeverityPipe', () => {
  let pipe: StatusSeverityPipe;

  beforeEach(() => {
    pipe = new StatusSeverityPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct color (severity) for request statuses', () => {
    expect(pipe.transform('new' as RequestStatus)).toBe('danger');
    expect(pipe.transform('in_progress' as RequestStatus)).toBe('warn');
    expect(pipe.transform('done' as RequestStatus)).toBe('success');
    expect(pipe.transform('rejected' as RequestStatus)).toBe('secondary');
  });

  it('should return the correct color (severity) for user statuses', () => {
    expect(pipe.transform('pending' as UserStatus)).toBe('warn');
    expect(pipe.transform('active' as UserStatus)).toBe('success');
    expect(pipe.transform('rejected' as UserStatus)).toBe('secondary');
  });

  it('should return a default color (secondary) for unknown status', () => {
    expect(pipe.transform('unknown_status' as any)).toBe('secondary');
  });
});
