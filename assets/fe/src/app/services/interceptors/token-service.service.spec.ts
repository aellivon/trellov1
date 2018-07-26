import { TestBed, inject } from '@angular/core/testing';

import { TokenServiceService } from './token-service.service';

describe('TokenServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenServiceService]
    });
  });

  it('should be created', inject([TokenServiceService], (service: TokenServiceService) => {
    expect(service).toBeTruthy();
  }));
});
