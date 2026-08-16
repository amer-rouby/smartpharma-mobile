import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export type AppLanguage = 'ar' | 'en';

const LANGUAGE_KEY = 'language';
const SUPPORTED_LANGUAGES: AppLanguage[] = ['ar', 'en'];
const DEFAULT_LANGUAGE: AppLanguage = 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly currentLangSubject = new BehaviorSubject<AppLanguage>(DEFAULT_LANGUAGE);

  readonly currentLang$: Observable<AppLanguage> = this.currentLangSubject.asObservable();

  constructor() {
    this.translate.addLangs(SUPPORTED_LANGUAGES);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
  }

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: LANGUAGE_KEY });
    const lang = (SUPPORTED_LANGUAGES as string[]).includes(value ?? '')
      ? (value as AppLanguage)
      : DEFAULT_LANGUAGE;
    await firstValueFrom(this.translate.use(lang));
    this.applyLanguage(lang);
  }

  async setLanguage(lang: AppLanguage): Promise<void> {
    await firstValueFrom(this.translate.use(lang));
    this.applyLanguage(lang);
    void Preferences.set({ key: LANGUAGE_KEY, value: lang });
  }

  toggleLanguage(): void {
    void this.setLanguage(this.getCurrentLanguage() === 'ar' ? 'en' : 'ar');
  }

  getCurrentLanguage(): AppLanguage {
    return this.currentLangSubject.getValue();
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  private applyLanguage(lang: AppLanguage): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    this.currentLangSubject.next(lang);
  }
}
