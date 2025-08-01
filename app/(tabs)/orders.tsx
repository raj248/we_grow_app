import { FlatList, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

const dummyOrders = [
  { id: '1', title: 'Views Package A', amount: '₹99', date: '2025-07-30' },
  { id: '2', title: 'Boost Shorts B', amount: '₹149', date: '2025-07-28' },
  { id: '3', title: 'Channel Promo C', amount: '₹199', date: '2025-07-25' },
];

export default function Orders() {
  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">
        Orders
      </Text>
      <FlatList
        data={dummyOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable className="p-4 bg-white mb-3 rounded-xl shadow-sm active:opacity-70">
            <Text className="font-semibold text-base">{item.title}</Text>
            <Text className="text-sm text-gray-600">Amount: {item.amount}</Text>
            <Text className="text-xs text-gray-500">Date: {item.date}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
