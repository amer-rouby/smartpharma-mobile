import { bootstrapApplication } from '@angular/platform-browser';
import { inject, provideAppInitializer } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { AuthService } from './app/core/services/auth.service';
import { LanguageService } from './app/core/services/language.service';
import { ThemeService } from './app/core/services/theme.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    // provideTranslateService() defaults `loader` to a no-op unless one is
    // passed into its own config - a loader provided as a sibling entry gets
    // silently shadowed by that default, so it must go here instead.
    provideTranslateService({
      fallbackLang: 'ar',
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    }),
    // Reads the stored session from Capacitor Preferences before the router
    // evaluates authGuard on the very first navigation - without this, a returning
    // logged-in user would get bounced to /login because the async Preferences
    // read hadn't resolved yet when the guard's synchronous isLoggedIn() ran.
    provideAppInitializer(() => inject(AuthService).init()),
    // Same reasoning: load the saved language/theme before first paint so the
    // app doesn't flash Arabic/light then snap to the user's real preference.
    provideAppInitializer(() => inject(LanguageService).init()),
    provideAppInitializer(() => inject(ThemeService).init()),
  ],
});
