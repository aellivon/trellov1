import { TestBed, inject } from '@angular/core/testing';

import { TokenValidationService } from './token-validation.service';

describe('TokenValidationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenValidationService]
    });
  });

  it('should be created', inject([TokenValidationService], (service: TokenValidationService) => {
    expect(service).toBeTruthy();
  }));
});
