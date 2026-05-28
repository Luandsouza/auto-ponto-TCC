import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCliente } from './sidebar-cliente';

describe('SidebarCliente', () => {
  let component: SidebarCliente;
  let fixture: ComponentFixture<SidebarCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
