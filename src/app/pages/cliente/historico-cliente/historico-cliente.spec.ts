import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoCliente } from './historico-cliente';

describe('HistoricoCliente', () => {
  let component: HistoricoCliente;
  let fixture: ComponentFixture<HistoricoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
