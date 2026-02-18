import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthLayoutService {
  public title = signal('Ваш дім.<br>Ваші правила.');
  public subtitle = signal('Єдина платформа для розумного управління ОСББ.');
  public bgGradient = signal('linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)');
}
