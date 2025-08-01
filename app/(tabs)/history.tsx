import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function History() {
  return (
    <>
      {/* <Stack.Screen options={{ title: 'History' }} /> */}
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/two.tsx" title="History" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
