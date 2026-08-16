import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly currentThemeSubject = new BehaviorSubject<ThemeMode>('light');
  readonly currentTheme$: Observable<ThemeMode> = this.currentThemeSubject.asObservable();

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: THEME_KEY });
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme: ThemeMode = value === 'light' || value === 'dark' ? value : prefersDark ? 'dark' : 'light';
    this.applyTheme(theme);
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
    void Preferences.set({ key: THEME_KEY, value: theme });
  }

  toggleTheme(): void {
    this.setTheme(this.getCurrentTheme() === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.getValue();
  }

  isDark(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
    this.currentThemeSubject.next(theme);
  }
}
