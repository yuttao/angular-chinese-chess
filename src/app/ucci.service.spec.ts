import { TestBed } from '@angular/core/testing';

import { UcciService } from './ucci.service';

describe('UcciService', () => {
  let service: UcciService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UcciService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
