import { useCallback, useEffect, useState } from 'react';
import { Image, FlatList, Pressable, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import Toast from 'react-native-toast-message';
import { usePurchaseStore } from '~/stores/usePurchaseStore';
import { useUserStore } from '~/stores/useUserStore';
import { getStoredUserId } from '~/utils/device-info';
import { useFocusEffect } from '@react-navigation/native';
import { PurchaseOption } from '~/types/entities';
import { router } from 'expo-router';

export default function Topup() {
  const { error, loading, purchaseOptions, purchase, fetchPurchaseOptions } = usePurchaseStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchaseOptions = useCallback(async () => {
    await fetchPurchaseOptions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchaseOptions();
    setRefreshing(false);
  }, [loadPurchaseOptions]);

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
    const id = useUserStore.getState().userId || (await getStoredUserId());
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

  const renderHeader = () => (
    <>
      <View
        className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-3 shadow-md"
        style={{ borderWidth: 1 }}>
        <View className="flex-row items-center gap-2">
          <Image
            source={require('~/assets/icons/rupee.png')}
            className="h-5 w-5"
            resizeMode="contain"
          />
          <Text className="text-base font-semibold ">Get Upto +10000 free credits</Text>
        </View>
        <Pressable
          className="rounded-md border bg-gray-100 px-4 py-1"
          onPress={() => router.push('/earn-or-purchase')}>
          <Text className="font-semibold text-gray-700">GO</Text>
        </Pressable>
      </View>
      <View className="my-1 mb-4 h-[1.5px] bg-gray-300" />
    </>
  );

  const renderItem = ({ item }: { item: PurchaseOption }) => {
    const hasDiscount = item.salePrice && item.originalPrice && item.salePrice < item.originalPrice;
    const discountPercent = hasDiscount
      ? Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100)
      : null;

    return (
      <Pressable
        onPress={() => handleDummyPurchase(item)}
        className="mb-3 flex-row items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm active:opacity-70"
        style={{ borderWidth: 1 }}>
        {/* Left side (coins) */}
        <View className="flex-row items-center">
          <Image
            source={require('~/assets/icons/rupee.png')}
            className="h-5 w-5"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold"> {item.coins}</Text>
        </View>

        {/* Right side (price + discount) */}
        <View className="flex-row items-center space-x-2">
          {discountPercent ? (
            <View className="mr-2 rounded-full border border-red-400 bg-red-100 px-2 py-0.5">
              <Text className="text-xs font-semibold text-red-500">{discountPercent}% off</Text>
            </View>
          ) : null}

          <View
            style={{ borderWidth: 1, borderRadius: 5, borderColor: 'green' }}
            className="px-5 py-1">
            <Text className="text-lg font-bold text-green-600">
              ₹{item.salePrice || item.originalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 flex-grow bg-gray-50 px-4 pt-4">
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : (
        <FlatList
          data={purchaseOptions}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
