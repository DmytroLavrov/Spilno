import { RequestStatus } from '@models/request.model';
import { StatusLabelPipe } from '@shared/pipes/status-label.pipe';
import { UserStatus } from '@models/user.model';

describe('StatusLabelPipe', () => {
  let pipe: StatusLabelPipe;

  beforeEach(() => {
    pipe = new StatusLabelPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should correctly translate request statuses (RequestStatus)', () => {
    expect(pipe.transform('new' as RequestStatus)).toBe('Нова');
    expect(pipe.transform('in_progress' as RequestStatus)).toBe('В обробці');
    expect(pipe.transform('done' as RequestStatus)).toBe('Виконано');
    expect(pipe.transform('rejected' as RequestStatus)).toBe('Відхилено');
  });

  it('should correctly translate user statuses (UserStatus)', () => {
    expect(pipe.transform('pending' as UserStatus)).toBe('Очікує');
    expect(pipe.transform('active' as RequestStatus)).toBe('Активний');
    expect(pipe.transform('rejected' as RequestStatus)).toBe('Відхилено');
  });

  it('should return the original value if the status is unknown', () => {
    const unknownStatus = 'some_weird_status';
    expect(pipe.transform(unknownStatus as any)).toBe(unknownStatus);
  });
});
