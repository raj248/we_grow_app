import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useState, useCallback } from 'react';
import { Badge } from 'react-native-paper';
import { getStoredUserId } from '~/utils/device-info';
import { useFocusEffect } from '@react-navigation/native';
import { useTransactionStore } from '~/stores/useTransactionStore';
import { useOrderStore } from '~/stores/useOrderStore';

export default function Orders() {
  const [refreshing, setRefreshing] = useState(false);
  const { error, loading, orders, loadOrders } = useOrderStore();

  const loadHistory = useCallback(async () => {
    setRefreshing(true);
    loadOrders();
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

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">
        Order History
      </Text>

      {loading ? (
        <Text className="text-center mt-4">Loading...</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const statusLabel =
              item.status === 'PENDING'
                ? 'Pending'
                : item.status === 'COMPLETED'
                  ? 'Completed'
                  : 'Failed';

            const colorMap = {
              Pending: '#fbbf24',
              Completed: '#10b981',
              Failed: '#ef4444',
            };

            // const amountColor = item. === 'CREDIT' ? '#10b981' : '#ef4444';

            return (
              <Pressable className="p-4 bg-background rounded-xl mb-2 border border-border shadow-md">
                {/* Top row with source and badges */}
                <View className="flex-row justify-between items-center mb-1">
                  {/* <Text variant="title3">{item.source}</Text> */}
                  <View className="flex-row gap-2">
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
                      }}
                    >
                      {statusLabel}
                    </Badge>
                    <Badge
                      style={{
                        backgroundColor: '#F0F0F0',
                        color: '#333',
                        fontSize: 12,
                        paddingHorizontal: 6,
                        borderRadius: 8,
                      }}
                    >
                      {item.status}
                    </Badge>
                  </View>
                </View>

                {/* Amount in bold, right aligned */}
                {/* <View className="flex-row justify-end mb-1">
                  <Text
                    className="font-bold text-base"
                    style={{ color: amountColor }}
                  >
                    ₹{item.amount}
                  </Text>
                </View> */}

                {/* Bottom row with date and transactionId */}
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {item.planId ?? 'Not available'}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
