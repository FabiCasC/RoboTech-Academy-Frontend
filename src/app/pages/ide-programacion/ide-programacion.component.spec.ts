import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeProgramacionComponent } from './ide-programacion.component';

describe('IdeProgramacionComponent', () => {
  let component: IdeProgramacionComponent;
  let fixture: ComponentFixture<IdeProgramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeProgramacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeProgramacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
