import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.dairymanagement.app',
  appName: 'Dairy Management',
  webDir: 'capacitor-web',
  // server: serverUrl
  //   ? {
  //       url: serverUrl,
  //       androidScheme: 'https',
  //     }
  //   : undefined,
  server: { url: 'https://dairy-management-one.vercel.app', cleartext: true },
};

export default config;
