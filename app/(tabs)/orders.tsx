import { FlatList, Pressable, RefreshControl, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useState, useCallback, useEffect } from 'react';
import { Badge, ProgressBar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useOrderStore } from '~/stores/useOrderStore';
import { Order } from '~/types/entities';
import { router } from 'expo-router';
import { fetchMultipleVideoDetails } from '~/lib/fetchVideoDetail';
import { detectYouTubeLinkType } from '~/utils/youtube-link-identifier';

export default function Orders() {
  const [refreshing, setRefreshing] = useState(false);
  const [enrichedOrders, setEnrichedOrders] = useState<Order[]>([]);
  const { loading, orders, loadOrders } = useOrderStore();

  const loadHistory = useCallback(async (soft = true) => {
    setRefreshing(true);
    await loadOrders(soft); // load raw orders first
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(async () => {
    await loadHistory(false);
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
    <View className="flex-1 px-4 pt-4">
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

            const type = detectYouTubeLinkType(item.url);

            // Build metrics dynamically based on non-zero boostPlan values
            const metrics: { label: string; progress: number; total: number; color: string }[] = [];

            if (item.boostPlan?.views && item.boostPlan?.views > 0) {
              metrics.push({
                label: type === 'shorts' ? 'Shorts Views' : 'Views',
                progress: item.progressViewCount ?? 0,
                total: item.boostPlan?.views,
                color: '#3B82F6',
              });
            }

            if (item.boostPlan?.likes && item.boostPlan?.likes > 0) {
              metrics.push({
                label: 'Likes',
                progress: item.progressLikeCount ?? 0,
                total: item.boostPlan?.likes,
                color: '#EF4444',
              });
            }

            if (item.boostPlan?.subscribers && item.boostPlan?.subscribers > 0) {
              metrics.push({
                label: 'Subscribers',
                progress: item.progressSubscriberCount ?? 0,
                total: item.boostPlan?.subscribers,
                color: '#10B981',
              });
            }

            return (
              <Pressable className="mb-2 rounded-xl border border-border bg-background p-4 shadow-md active:opacity-70">
                {/* Status Badge */}
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
                </View>

                {/* Plan Title */}
                <Text variant="title3" className="mb-2">
                  {item.boostPlan?.title ?? 'Unknown Plan'}
                </Text>

                {/* Metrics Progress */}
                {metrics.map((metric) => {
                  const percentage = Math.min(1, metric.progress / Math.max(metric.total, 1));
                  const remaining = metric.total - metric.progress;
                  return (
                    <View key={metric.label} className="mb-2">
                      <Text className="mb-1 text-sm font-medium">{metric.label}</Text>
                      <ProgressBar progress={percentage} color={metric.color} />
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {metric.progress} / {metric.total} ({remaining} left)
                      </Text>
                    </View>
                  );
                })}

                {/* Video Thumbnail + Title */}
                {item.videoTitle && (
                  <View className="mb-2 flex-row items-center">
                    {item.videoThumbnail && (
                      <Image
                        source={{ uri: item.videoThumbnail }}
                        style={{ width: 80, height: 45, borderRadius: 6, marginRight: 8 }}
                      />
                    )}
                    <Text className="text-md flex-1 font-semibold" numberOfLines={2}>
                      {item.videoTitle || item.url}
                    </Text>
                  </View>
                )}

                {/* Date + Price */}
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <View
                    className="flex-row items-center gap-1 rounded-full bg-gray-100 px-2 py-1"
                    style={{ borderWidth: 1, borderRadius: 15, borderColor: '#ccc' }}>
                    <Image
                      source={require('~/assets/icons/rupee.png')}
                      className="h-5 w-5"
                      resizeMode="contain"
                    />
                    <Text className="text-sm text-muted-foreground">{item.boostPlan?.price}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
