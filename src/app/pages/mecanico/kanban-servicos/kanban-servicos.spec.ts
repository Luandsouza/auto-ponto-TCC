import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanServicos } from './kanban-servicos.component';

describe('KanbanServicos', () => {
  let component: KanbanServicos;
  let fixture: ComponentFixture<KanbanServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanServicos],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
