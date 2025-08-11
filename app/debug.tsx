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
    // Listen for YouTube watch event from native module
    const sub = displayOverApp.addListener('onYoutubeWatch', (payload) => {
      console.log('YouTube watch duration:', payload.duration);
      setLastWatchDuration(payload.duration);
    });

    return () => {
      sub.remove();
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

    // Optional: request Accessibility permission too
    // const res = await displayOverApp.requestAccessibilityPermission();
    // console.log('Accessibility permission granted:', res);

    console.warn('Code block reached after permissions');

    // Show overlay for 10 seconds
    await displayOverApp.showOverlay(10);
  };

  const openYouTubeVideo = async () => {
    try {
      await displayOverApp.startYoutubeWatch(); // ✅ New call to mark start time
      Linking.openURL('vnd.youtube://watch?v=dQw4w9WgXcQ'); // Replace with your video ID
    } catch (err) {
      console.error('Error starting YouTube watch', err);
    }
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
      </View>
    </View>
  );
}
