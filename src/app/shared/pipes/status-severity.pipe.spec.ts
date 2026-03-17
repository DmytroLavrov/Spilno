import { StatusSeverityPipe } from './status-severity.pipe';

describe('StatusSeverityPipe', () => {
  it('create an instance', () => {
    const pipe = new StatusSeverityPipe();
    expect(pipe).toBeTruthy();
  });
});
