import { FlatList, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useState } from 'react';

const dummyHistory = [
  { id: '1', title: '1000 Views Package', date: '2025-07-31', status: 'Completed' },
  { id: '2', title: '500 Views Package', date: '2025-07-29', status: 'Pending' },
  { id: '3', title: '2000 Views Package', date: '2025-07-25', status: 'Completed' },
];

export default function History() {
  const [history] = useState(dummyHistory);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">Order History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              // Placeholder: Replace with navigation or modal
              console.log(`Pressed ${item.title}`);
            }}
            className="p-4 bg-background rounded-xl mb-2 border border-border shadow-md"
          >
            <Text variant="title3" className="mb-1">{item.title}</Text>
            <Text className="text-sm text-muted-foreground">Date: {item.date}</Text>
            <Text className="text-sm text-muted-foreground">Status: {item.status}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
