import { useEffect, useState } from 'react';
import { FlatList, Pressable, View, ActivityIndicator } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { PurchaseOption } from '~/types/entities';
import { Snackbar } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { getAllPurchaseOptions } from '~/api/purchase';
import { usePurchaseStore } from '~/stores/usePurchaseStore';
import { useUserStore } from '~/stores/useUserStore';

export default function Orders() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { error, loading, purchaseOptions, purchase, fetchPurchaseOptions } = usePurchaseStore();

  useEffect(() => {
    fetchPurchaseOptions();
  }, []);


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
    const id = useUserStore.getState().userId;
    if (!id) return;
    const result = await purchase(id, item.googleProductId, item.id); // item.id should be replaced with the razorpay id
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

      {loading ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : (
        <FlatList
          data={purchaseOptions}
          keyExtractor={(item) => item.id}
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
