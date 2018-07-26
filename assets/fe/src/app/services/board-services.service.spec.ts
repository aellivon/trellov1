import { TestBed, inject } from '@angular/core/testing';

import { BoardServicesService } from './board-services.service';

describe('BoardServicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardServicesService]
    });
  });

  it('should be created', inject([BoardServicesService], (service: BoardServicesService) => {
    expect(service).toBeTruthy();
  }));
});
