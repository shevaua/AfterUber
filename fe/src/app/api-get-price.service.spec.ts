import { TestBed } from '@angular/core/testing';

import { ApiGetPriceService } from './api-get-price.service';

describe('ApiGetPriceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiGetPriceService = TestBed.get(ApiGetPriceService);
    expect(service).toBeTruthy();
  });
});
