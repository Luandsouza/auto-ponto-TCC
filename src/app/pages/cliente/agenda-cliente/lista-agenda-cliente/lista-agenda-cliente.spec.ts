import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaAgendaCliente } from './lista-agenda-cliente';

describe('ListaAgendaCliente', () => {
  let component: ListaAgendaCliente;
  let fixture: ComponentFixture<ListaAgendaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaAgendaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAgendaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
