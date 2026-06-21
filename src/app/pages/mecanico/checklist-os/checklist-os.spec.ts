import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistOsComponent } from './checklist-os.component';

describe('ChecklistOs', () => {
  let component: ChecklistOsComponent;
  let fixture: ComponentFixture<ChecklistOsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistOsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistOsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
