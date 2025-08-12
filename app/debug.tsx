import { AppState } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View, Linking } from 'react-native';
import { Button } from '~/components/Button';
import { Text } from '~/components/nativewindui/Text';
import { fetchActiveUserCount } from '~/lib/api/api';
import displayOverApp from '~/modules/display-over-app';

export default function Modal() {
  const [lastActiveCount, setLastActiveCount] = useState(-1);
  const [lastWatchDuration, setLastWatchDuration] = useState<number | null>(null);

  useEffect(() => {
    let youtubeOpenFired = false;

    const sub = displayOverApp.addListener('onYoutubeWatch', (payload) => {
      console.log('YouTube watch duration:', payload.duration);
      setLastWatchDuration(payload.duration);
      youtubeOpenFired = false;
    });

    const sub2 = displayOverApp.addListener('onYoutubeOpen', (payload) => {
      if (youtubeOpenFired) return;
      youtubeOpenFired = true;

      console.log('YouTube opened at:', payload.timestamp);
      setLastWatchDuration(null);
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        console.log('App came to foreground → removing overlay');
        displayOverApp.removeOverlay()
          .then(() => console.log('Overlay removed due to app foreground'));
      }
    });

    return () => {
      sub.remove();
      sub2.remove();
      appStateSub.remove();
    };
  }, []);

  const triggerFetchActive = async () => {
    try {
      const res = await fetchActiveUserCount();
      console.log('Active user count:', res);
      const count = res.data ?? -1;
      setLastActiveCount(count);
    } catch (err) {
      console.error('Error fetching active user count', err);
    }
  };

  const triggerOverlay = async () => {
    const overlayGranted = await displayOverApp.requestOverlayPermission();
    if (!overlayGranted) {
      console.warn('Overlay permission not granted');
      return;
    }
    console.log('Overlay permission granted:', overlayGranted);
    await displayOverApp.showOverlay(10);
  };

  const openYouTubeVideo = async () => {
    try {
      const overlayGranted = await displayOverApp.showOverlay(80);
      if (!overlayGranted) {
        console.warn("Overlay permission not granted or overlay failed to show");
        return;
      }

      // Open YouTube
      Linking.openURL("vnd.youtube://watch?v=dQw4w9WgXcQ");

      // Start timer overlay
      const timerShown = await displayOverApp.showTimerOverlay();
      if (!timerShown) {
        console.warn("Timer overlay could not be shown");
        return;
      }

      let seconds = 0;
      // const timerId = setInterval(() => {
      //   seconds++;
      //   console.log("Timer: " + seconds + "s")
      //   displayOverApp.updateTimerText(`Timer: ${seconds}s`);
      // }, 1000);

      // Store timerId somewhere so you can clear it later
      // Example: in a ref or global store
      // globalThis.currentTimerId = timerId;

    } catch (err) {
      console.error("Error starting YouTube watch", err);
    }
  };


  const triggerShowTimer = async () => {
    const overlayGranted = await displayOverApp.requestOverlayPermission();
    if (!overlayGranted) {
      console.warn('Overlay permission not granted');
      return;
    }
    console.log('Overlay permission granted:', overlayGranted);
    const ran = await displayOverApp.showTimerOverlay();
    console.log('Ran:', ran);

  };

  const triggerHideTimer = async () => {
    const ran = await displayOverApp.hideTimerOverlay();
    console.log('Stopped:', ran);
  };

  return (
    <View className="flex-1 p-4">
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Text className="mb-2 text-lg font-bold">Debug Panel</Text>

      <Text>Last Active Users: {lastActiveCount}</Text>
      <Text>Last YouTube Watch Duration: {lastWatchDuration ?? 'N/A'} sec</Text>

      <View className="mt-4 space-y-2">
        <Button title="Fetch Active User" onPress={triggerFetchActive} />
        <Button title="Router.push(Template)" onPress={() => router.push('/template_index')} />
        <Button title="Show Overlay (10s)" onPress={triggerOverlay} />
        <Button title="Open YouTube Video" onPress={openYouTubeVideo} />
        <Button title="Show Timer" onPress={triggerShowTimer} />
        <Button title="Hide Timer" onPress={triggerHideTimer} />
      </View>
    </View>
  );
}
