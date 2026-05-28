import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarCliente } from './topbar-cliente';

describe('TopbarCliente', () => {
  let component: TopbarCliente;
  let fixture: ComponentFixture<TopbarCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
