import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { IdeProgramacionComponent } from './ide-programacion.component';

describe('IdeProgramacionComponent', () => {
  let component: IdeProgramacionComponent;
  let fixture: ComponentFixture<IdeProgramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeProgramacionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(IdeProgramacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
