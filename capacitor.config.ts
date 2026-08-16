import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartpharma.mobile',
  appName: 'صيدليتي الذكية',
  webDir: 'www',
  server: {
    // Capacitor 3+ defaults this to https, which makes the WebView block every
    // request to the plain-HTTP LAN backend as mixed content - confirmed via
    // chrome://inspect: "Mixed Content: The page at 'https://localhost/login'
    // ... requested an insecure XMLHttpRequest endpoint 'http://...'. blocked."
    androidScheme: 'http'
  }
};

export default config;
