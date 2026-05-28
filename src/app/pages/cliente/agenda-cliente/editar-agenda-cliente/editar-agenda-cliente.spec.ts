import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAgendaCliente } from './editar-agenda-cliente';

describe('EditarAgendaCliente', () => {
  let component: EditarAgendaCliente;
  let fixture: ComponentFixture<EditarAgendaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAgendaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarAgendaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
