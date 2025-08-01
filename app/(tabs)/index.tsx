import { View, FlatList } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import React, { useEffect, useState } from 'react';
import { getOrCreateGuestId } from '~/utils/device-info';
import { ProgressBar } from 'react-native-paper'; // or use any progress bar lib you have

const features = [
  { id: '1', title: 'Boost Views', description: 'Increase views on your videos using coins.' },
  { id: '2', title: 'Get Subscribers', description: 'Gain real engagement via smart distribution.' },
  { id: '3', title: 'Promote Shorts', description: 'Targeted exposure for YouTube Shorts.' },
];

export default function Home() {
  const [id, setId] = useState('Loading...');
  const [progress, setProgress] = useState(0.4); // Dummy pending progress: 40%

  useEffect(() => {
    getOrCreateGuestId()
      .then(setId)
      .catch((err) => setId(String(err)));
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="text-center mb-2">Welcome to BoostHub</Text>

      <View className="bg-gray-100 p-4 rounded-xl mb-4">
        <Text className="text-sm font-semibold text-gray-700">Your User ID:</Text>
        <Text className="text-lg font-mono text-primary">{id}</Text>
      </View>

      {/* 🔁 Pending Order */}
      <View className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-4">
        <Text className="font-semibold text-yellow-900 mb-2">Pending Order</Text>
        <Text className="text-sm text-yellow-800 mb-1">Boosting "My Summer Vlog"... (Views)</Text>
        <ProgressBar
          progress={progress}
          color="#fbbf24"
          className="h-2 rounded-full"
        />
        <Text className="text-right text-xs text-yellow-700 mt-1">{Math.floor(progress * 100)}%</Text>
      </View>

      <Text className="text-lg font-semibold mb-2">What you can do:</Text>

      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="shadow-md bg-white rounded-xl p-4 mb-3">
            <Text className="font-bold text-base">{item.title}</Text>
            <Text className="text-sm text-gray-600">{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
