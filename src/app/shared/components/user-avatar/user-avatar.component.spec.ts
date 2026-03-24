import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserAvatarComponent', () => {
  let component: UserAvatarComponent;
  let fixture: ComponentFixture<UserAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarComponent);
    component = fixture.componentInstance;

    // Set required input
    fixture.componentRef.setInput('name', 'Іван Франко');
    fixture.detectChanges();
  });

  it('should be successfully created', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly calculate the initials for a two-word name', () => {
    fixture.componentRef.setInput('name', 'Іван Франко');
    expect(component.initials()).toBe('ІФ');
  });

  it('should only take the first letter if the name consists of one word', () => {
    fixture.componentRef.setInput('name', 'Admin');
    expect(component.initials()).toBe('A');
  });

  it('should ignore extra spaces', () => {
    fixture.componentRef.setInput('name', '   Тарас    Шевченко  ');
    expect(component.initials()).toBe('ТШ');
  });

  it('should return "?" if name is empty', () => {
    fixture.componentRef.setInput('name', '   ');
    expect(component.initials()).toBe('?');
  });

  it('should use custom color if passed', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    // Check the computed signal avatarStyle()
    expect(component.avatarStyle().background).toBe('#ff0000');
    expect(component.avatarStyle().color).toBe('#fff');
  });

  it('should generate a deterministic color if the custom color is missing (null)', () => {
    fixture.componentRef.setInput('color', null);
    fixture.componentRef.setInput('name', 'Анна');

    const style1 = component.avatarStyle();
    expect(style1.background).toBeDefined();
    expect(style1.background).not.toBeNull();

    // If you pass the same name, the color should be the same
    fixture.componentRef.setInput('name', 'Анна');
    expect(component.avatarStyle().background).toBe(style1.background);

    // A different name (with a different first letter) will probably give a different color (checking the index logic)
    fixture.componentRef.setInput('name', 'Яна');
    const style2 = component.avatarStyle();
    // (Although technically they could match because of the %, we're just checking that it generates something)
    expect(style2.background).toBeDefined();
  });
});
