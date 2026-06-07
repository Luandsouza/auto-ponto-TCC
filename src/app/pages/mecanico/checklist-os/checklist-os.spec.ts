import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistOs } from './checklist-os.component';

describe('ChecklistOs', () => {
  let component: ChecklistOs;
  let fixture: ComponentFixture<ChecklistOs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistOs],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistOs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
