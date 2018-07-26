import { InterceptorsModule } from './interceptors.module';

describe('InterceptorsModule', () => {
  let interceptorsModule: InterceptorsModule;

  beforeEach(() => {
    interceptorsModule = new InterceptorsModule();
  });

  it('should create an instance', () => {
    expect(interceptorsModule).toBeTruthy();
  });
});
