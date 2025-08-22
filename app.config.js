import 'dotenv/config';
const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? 'we_grow(dev)' : 'YouReach Booster',
    slug: 'we_grow',
    version: '1.0.0',
    scheme: 'we_grow',
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-dev-launcher',
        {
          launchMode: 'most-recent',
        },
      ],
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.youreachbooster.tech.zenex',
    },
    android: {
      permissions: ['INTERNET'],
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.youreachbooster.tech.zenex',
      googleServicesFile: process.env.GOOGLE_SERVICES_FILE,
      useNextNotificationsApi: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '5fd3cbdb-f423-4c38-9eae-e41aa34c373c',
      },
    },
  },
};
