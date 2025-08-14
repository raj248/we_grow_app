import { FlatList, Pressable, RefreshControl, View, Image } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useState, useCallback, useEffect } from 'react';
import { Badge, ProgressBar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useOrderStore } from '~/stores/useOrderStore';
import { Order } from '~/types/entities';

const fetchVideoDetails = async (orders: Order[]) => {
  if (!orders || orders.length === 0) return [];
  try {
    return await Promise.all(
      orders.map(async (order) => {
        const url = order.url;
        if (!url?.includes("youtube.com") && !url?.includes("youtu.be")) {
          return { ...order, videoTitle: "Invalid YouTube URL", videoThumbnail: "https://via.placeholder.com/320x180?text=Invalid+URL" };
        }
        try {
          const res = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          );
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          return { ...order, videoTitle: data.title, videoThumbnail: data.thumbnail_url };
        } catch {
          return { ...order, videoTitle: "Failed to fetch title", videoThumbnail: "https://via.placeholder.com/320x180?text=Error" };
        }
      })
    );
  } catch (e) {
    console.error(e);
    return orders;
  }
};

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
    const unenriched = orders.filter(o => !o.videoTitle || !o.videoThumbnail);
    if (unenriched.length > 0) {
      fetchVideoDetails(unenriched).then((enriched) => {
        setEnrichedOrders((prev) =>
          prev.map((o) => enriched.find((e) => e.id === o.id) ?? o)
        );
      });
    }
  }, [orders]);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">Order History</Text>
      {loading ? (
        <Text className="text-center mt-4">Loading...</Text>
      ) : (
        <FlatList
          data={enrichedOrders}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const statusLabel =
              item.status === 'PENDING' ? 'Pending'
                : item.status === 'COMPLETED' ? 'Completed'
                  : 'Failed';
            const colorMap = {
              Pending: '#fbbf24',
              Completed: '#10b981',
              Failed: '#ef4444',
            };
            const totalRequired =
              item.boostPlan?.type === 'VIEW'
                ? item.boostPlan.views
                : item.boostPlan?.likes || 0;
            const remaining = Math.max(totalRequired - item.completedCount, 0);
            const progress = totalRequired > 0 ? item.completedCount / totalRequired : 0;

            return (
              <Pressable className="p-4 bg-background rounded-xl mb-2 border border-border shadow-md">
                {/* Status Badges */}
                <View className="flex-row justify-between items-center mb-1">
                  <Badge style={{
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colorMap[statusLabel],
                    color: colorMap[statusLabel],
                    fontSize: 12,
                    fontWeight: '600',
                    paddingHorizontal: 6,
                    borderRadius: 8,
                  }}>{statusLabel}</Badge>
                  <Badge style={{
                    backgroundColor: '#F0F0F0',
                    color: '#333',
                    fontSize: 12,
                    paddingHorizontal: 6,
                    borderRadius: 8,
                  }}>
                    {`${item.boostPlan?.type ?? 'N/A'} • ₹${item.boostPlan?.price ?? 0}`}
                  </Badge>
                </View>

                {/* Plan title */}
                <Text variant="title3" className="mb-1">
                  {item.boostPlan?.title ?? 'Unknown Plan'}
                </Text>

                {/* Progress */}
                <View className="mb-2">
                  <ProgressBar progress={progress} color="#3b82f6" />
                  <Text className="text-sm mt-1">
                    {item.completedCount} <Text className="text-xs text-muted-foreground">/ {totalRequired}</Text> done ({remaining} left)
                  </Text>
                </View>

                {/* Video Thumbnail + Title */}
                {item.videoThumbnail && (
                  <View className="flex-row items-center mb-2">
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
