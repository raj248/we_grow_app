import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from 'react-native-paper';
import { getStoredUserId } from '~/utils/device-info';
import { Transaction } from '~/types/entities';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTransactionHistory } from '~/lib/api/transactions';
import { useTransactionStore } from '~/stores/useTransactionStore';

export default function History() {
  const [refreshing, setRefreshing] = useState(false);
  const { error, loading, transactions, loadTransactions } = useTransactionStore();

  const loadHistory = useCallback(async (soft = true) => {
    const userId = await getStoredUserId();
    if (!userId) return;
    setRefreshing(true);
    loadTransactions(userId, soft);
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

  return (
    <View className="flex-1 p-4">
      {loading ? (
        <Text className="mt-4 text-center">Loading...</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const statusLabel =
              item.status === 'PENDING'
                ? 'Pending'
                : item.status === 'SUCCESS'
                  ? 'Completed'
                  : 'Failed';

            const colorMap = {
              Pending: '#fbbf24',
              Completed: '#10b981',
              Failed: '#ef4444',
            };

            const amountColor = item.type === 'CREDIT' ? '#10b981' : '#ef4444';

            return (
              <Pressable
                className="mb-3 rounded-lg border border-gray-300 bg-white p-3 shadow-md active:opacity-70"
                onPress={() => console.log('Show Transaction Details Dialog')}>
                {/* Top row */}
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-lg font-semibold">{item.source}</Text>
                  <View className="flex-row space-x-2">
                    <View
                      className="mr-2 rounded-full px-3"
                      style={{
                        backgroundColor: '#ecfdf5',
                        borderWidth: 1,
                        borderColor: colorMap[statusLabel],
                      }}>
                      <Text
                        style={{
                          paddingHorizontal: 10,
                          color: colorMap[statusLabel],
                          fontWeight: '600',
                          fontSize: 12,
                        }}>
                        {statusLabel}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: item.type == 'CREDIT' ? '#ecfdf5' : '#f8f4f4' }}>
                      <Text
                        className="px-4 text-xs font-semibold"
                        style={{
                          textDecorationColor: item.type == 'CREDIT' ? '#10b981' : '#ef4444',
                          color: item.type == 'CREDIT' ? '#10b981' : '#ef4444',
                        }}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Amount */}
                <View className="mb-1 flex-row justify-end">
                  <Text className="text-base font-bold" style={{ color: amountColor }}>
                    ₹{item.amount.toFixed(2)}
                  </Text>
                </View>

                {/* Bottom row */}
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Check Details</Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
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
