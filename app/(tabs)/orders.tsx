import { useEffect, useState } from 'react';
import { FlatList, Pressable, View, ActivityIndicator } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { getAllPurchaseOptions } from '~/lib/api'; // update this import
import { PurchaseOption } from '~/types/entities';


export default function Orders() {
  const [data, setData] = useState<PurchaseOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPurchaseOptions()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text variant="title1" className="mb-4 text-center">Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable className="p-4 bg-white mb-3 rounded-xl shadow-md active:opacity-70">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-semibold text-base">
                  {item.googleProductId}
                </Text>
                <Text className="text-green-700 font-bold">
                  +{item.coins} Coins
                </Text>
              </View>
              <Text className="text-xs text-gray-500">
                Created at: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
