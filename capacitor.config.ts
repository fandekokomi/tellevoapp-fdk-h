import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tellevoapp.fdkh',
  appName: 'tellevoapp-fdk-h',
  webDir: 'www',
  plugins: {
    "GoogleAuth": {
      "scopes": [
        "profile",
        "email"
      ],
      "serverClientId": "926921643583-7v216n9qrk8tfelei5iu2g1cv9la3hpa.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
};

export default config;
