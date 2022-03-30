import { jacocoReportsPlugin } from './plugin';

describe('jacoco-reports', () => {
  it('should export plugin', () => {
    expect(jacocoReportsPlugin).toBeDefined();
  });
});
