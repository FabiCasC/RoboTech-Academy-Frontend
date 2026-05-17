import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Laboratorio2dComponent } from './laboratorio2d.component';

describe('Laboratorio2dComponent', () => {
  let component: Laboratorio2dComponent;
  let fixture: ComponentFixture<Laboratorio2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Laboratorio2dComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Laboratorio2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});