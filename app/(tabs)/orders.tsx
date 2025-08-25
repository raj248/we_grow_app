import { FlatList, Pressable, RefreshControl, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useState, useCallback, useEffect } from 'react';
import { Badge, ProgressBar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useOrderStore } from '~/stores/useOrderStore';
import { Order } from '~/types/entities';
import { router } from 'expo-router';
import { fetchMultipleVideoDetails } from '~/lib/fetchVideoDetail';

export default function Orders() {
  const [refreshing, setRefreshing] = useState(false);
  const [enrichedOrders, setEnrichedOrders] = useState<Order[]>([]);
  const { loading, orders, loadOrders } = useOrderStore();

  const loadHistory = useCallback(async () => {
    setRefreshing(true);
    await loadOrders(); // load raw orders first
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadHistory();
      })();
    }, [loadHistory])
  );

  // Background enrichment
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    setEnrichedOrders(orders); // show instantly with raw data
    const unenriched = orders.filter((o) => !o.videoTitle || !o.videoThumbnail);
    if (unenriched.length > 0) {
      fetchMultipleVideoDetails(unenriched).then((enriched) => {
        setEnrichedOrders((prev) => prev.map((o) => enriched.find((e) => e.id === o.id) ?? o));
      });
    }
  }, [orders]);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">
        Order History
      </Text>
      {loading ? (
        <Text className="mt-4 text-center">Loading...</Text>
      ) : (
        <FlatList
          data={enrichedOrders}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-center text-lg font-semibold">
                Oops! You haven’t placed any orders yet.
              </Text>
              <Text className="mt-2 text-center text-gray-600">
                Don’t miss out! Unlock awesome features and perks by choosing a plan that fits you.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')} // adjust to your plan screen
                className="mt-4 self-center rounded-full bg-blue-500 px-6 py-2">
                <Text className="text-center font-bold text-white">View Plans</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const statusLabel =
              item.status === 'PENDING'
                ? 'Pending'
                : item.status === 'ACTIVE'
                  ? 'Active'
                  : item.status === 'COMPLETED'
                    ? 'Completed'
                    : 'Failed';
            const colorMap = {
              Pending: '#fbbf24',
              Active: '#1089b9ff',
              Completed: '#10b981',
              Failed: '#ef4444',
            };
            const totalRequired = item.boostPlan.views;
            const remaining = Math.max(totalRequired - item.completedCount, 0);
            const progress = totalRequired > 0 ? item.completedCount / totalRequired : 0;

            return (
              <Pressable className="mb-2 rounded-xl border border-border bg-background p-4 shadow-md">
                {/* Status Badges */}
                <View className="mb-1 flex-row items-center justify-between">
                  <Badge
                    style={{
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: colorMap[statusLabel],
                      color: colorMap[statusLabel],
                      fontSize: 12,
                      fontWeight: '600',
                      paddingHorizontal: 6,
                      borderRadius: 8,
                    }}>
                    {statusLabel}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: '#F0F0F0',
                      color: '#333',
                      fontSize: 12,
                      paddingHorizontal: 6,
                      borderRadius: 8,
                    }}>
                    {`${item.boostPlan?.duration ?? 'N/A'} Second • ₹${item.boostPlan?.price ?? 0}`}
                  </Badge>
                </View>

                {/* Plan title */}
                <Text variant="title3" className="mb-1">
                  {item.boostPlan?.title ?? 'Unknown Plan'}
                </Text>

                {/* Progress */}
                <View className="mb-2">
                  <ProgressBar progress={progress} color="#3b82f6" />
                  <Text className="mt-1 text-sm">
                    {item.completedCount}{' '}
                    <Text className="text-xs text-muted-foreground">/ {totalRequired}</Text> done (
                    {remaining} left)
                  </Text>
                </View>

                {/* Video Thumbnail + Title */}
                {item.videoThumbnail && (
                  <View className="mb-2 flex-row items-center">
                    <Image
                      source={{ uri: item.videoThumbnail }}
                      style={{ width: 80, height: 45, borderRadius: 6, marginRight: 8 }}
                    />
                    <Text className="flex-1 text-sm" numberOfLines={2}>
                      {item.videoTitle || item.url}
                    </Text>
                  </View>
                )}

                {/* Date */}
                <Text className="text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
