import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentDashboardComponent } from './resident-dashboard.component';

describe('ResidentDashboardComponent', () => {
  let component: ResidentDashboardComponent;
  let fixture: ComponentFixture<ResidentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
