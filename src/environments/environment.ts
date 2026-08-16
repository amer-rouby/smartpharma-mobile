// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Works as-is when running in the browser (`ionic serve`) or an Android emulator,
  // since both can reach the dev machine's own localhost. A physical phone on the
  // same network needs the dev machine's LAN IP instead (e.g. http://192.168.1.x:8081/api) -
  // localhost on a real device means the phone itself, not this computer.
  apiUrl: 'http://localhost:8081/api',
  appName: 'صيدليتي الذكية',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
