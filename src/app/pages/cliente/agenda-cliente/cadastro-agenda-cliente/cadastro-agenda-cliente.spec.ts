import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAgendaCliente } from './cadastro-agenda-cliente';

describe('CadastroAgendaCliente', () => {
  let component: CadastroAgendaCliente;
  let fixture: ComponentFixture<CadastroAgendaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAgendaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroAgendaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
