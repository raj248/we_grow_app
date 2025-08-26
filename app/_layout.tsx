import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

import { Provider as PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from '~/components/global/SnackbarProvider';
import Toast from 'react-native-toast-message';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

import { youtubeListenerService } from '~/services/youtubeListener';
import { HeaderButton } from '~/components/HeaderButton';
import { View } from 'react-native';
import { CoinHeader } from '~/components/CoinHeader';
youtubeListenerService.init(); // runs once

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      {/* WRAP YOUR APP WITH ANY ADDITIONAL PROVIDERS HERE */}
      {/* <ExampleProvider> */}

      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <SnackbarProvider />
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <Stack screenOptions={SCREEN_OPTIONS}>
                  <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
                  <Stack.Screen name="modal" options={MODAL_OPTIONS} />
                  <Stack.Screen name="settings" options={MODAL_OPTIONS} />
                  <Stack.Screen name="watch-and-earn-modal" options={WATCH_EARN_OPTIONS} />
                  <Stack.Screen name="earn-or-purchase" options={WATCH_EARN_OPTIONS} />

                  <Stack.Screen name="boostviewplans" options={MODAL_OPTIONS} />
                  <Stack.Screen name="getsubscribersplans" options={MODAL_OPTIONS} />
                  <Stack.Screen name="promoteshortsplans" options={MODAL_OPTIONS} />
                  <Stack.Screen name="debug" options={DEBUG_PANEL_OPTIONS} />
                </Stack>
                <Toast
                  avoidKeyboard
                  autoHide
                  position="top"
                  swipeable
                  visibilityTime={3000}
                  bottomOffset={80}
                  topOffset={80}
                  // config={{}}
                />
              </NavThemeProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </PaperProvider>
      </GestureHandlerRootView>

      {/* </ExampleProvider> */}
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;

const MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Settings',
  gestureEnabled: true, // allow swipe down to dismiss
  showHeader: false, // hides default header (prevents status bar overlap)
  contentStyle: {
    // optional styling for the modal container
    paddingTop: 0, // remove default padding if needed
    // backgroundColor: '#fff',        // make sure background is white
  },
  headerRight: () => <ThemeToggle />,
} as const;

const DEBUG_PANEL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Debug',
  gestureEnabled: true, // allow swipe down to dismiss
  showHeader: false, // hides default header (prevents status bar overlap)
  contentStyle: {
    // optional styling for the modal container
    paddingTop: 0, // remove default padding if needed
    // backgroundColor: '#fff',        // make sure background is white
  },
  headerRight: () => <ThemeToggle />,
} as const;

const WATCH_EARN_OPTIONS = {
  presentation: 'modal', // modal presentation
  animation: 'fade_from_bottom',
  title: 'Watch & Earn',
  gestureEnabled: true,
  contentStyle: {
    paddingTop: 0,
  },
  headerRight: () => (
    <View className="flex-row">
      <CoinHeader />
      <Link href="/settings" asChild>
        <HeaderButton />
      </Link>
    </View>
  ),
} as const;
