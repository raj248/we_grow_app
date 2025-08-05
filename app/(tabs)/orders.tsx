import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { PurchaseOption } from '~/types/entities';
import Toast from 'react-native-toast-message';
import { usePurchaseStore } from '~/stores/usePurchaseStore';
import { useUserStore } from '~/stores/useUserStore';
import { getStoredUserId } from '~/utils/device-info';
import { useFocusEffect } from '@react-navigation/native';

export default function Orders() {
  const { error, loading, purchaseOptions, purchase, fetchPurchaseOptions } = usePurchaseStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchaseOptions = useCallback(async () => {
    await fetchPurchaseOptions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchaseOptions();
    setRefreshing(false);
  }, [loadPurchaseOptions])

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadPurchaseOptions();
      })();
    }, [loadPurchaseOptions])
  );

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
    }
  }, [error]);

  const handleDummyPurchase = async (item: PurchaseOption) => {
    const id = useUserStore.getState().userId || await getStoredUserId();
    const fakeTransactionId = Math.random().toString(36).substring(2, 10);

    if (!id) return;
    const result = await purchase(id, item.googleProductId, fakeTransactionId);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Purchase Failed',
        text2: result.error || 'Something went wrong.',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Purchase Successful',
      text2: `You have successfully purchased ${item.coins} coins!`,
    });
  };
  return (
    <View className="flex-1 flex-grow px-4 bg-gray-50">
      <Text variant="title1" className="mb-4 text-center">Orders</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : (
        <FlatList
          data={purchaseOptions}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleDummyPurchase(item)}
              className="p-4 bg-white mb-3 rounded-xl shadow-md active:opacity-70"
            >
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
