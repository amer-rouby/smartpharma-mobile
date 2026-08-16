export const environment = {
  production: true,
  // Native builds have no dev-server proxy, so this must be a real reachable
  // address, not localhost (which on a phone means the phone itself). Points
  // at the dev machine's LAN IP for now - swap for a real deployed URL once
  // the backend is hosted somewhere permanent.
  apiUrl: 'http://192.168.0.204:8081/api',
  appName: 'صيدليتي الذكية',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};
