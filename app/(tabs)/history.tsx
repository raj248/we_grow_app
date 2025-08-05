import { FlatList, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useEffect, useState } from 'react';
import { Badge } from 'react-native-paper';
import { fetchTransactionHistory } from '~/lib/api';
import { getStoredUserId } from '~/utils/device-info';
import { Transaction } from '~/types/entities';

export default function History() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userId = await getStoredUserId();
      if (!userId) return;

      const res = await fetchTransactionHistory(userId);
      if (res.success && res.data) {
        setHistory(res.data);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">
        Order History
      </Text>

      {loading ? (
        <Text className="text-center mt-4">Loading...</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
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
              <Pressable className="p-4 bg-background rounded-xl mb-2 border border-border shadow-md">
                {/* Top row with source and badges */}
                <View className="flex-row justify-between items-center mb-1">
                  <Text variant="title3">{item.source}</Text>
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
                      {item.type}
                    </Badge>
                  </View>
                </View>

                {/* Amount in bold, right aligned */}
                <View className="flex-row justify-end mb-1">
                  <Text
                    className="font-bold text-base"
                    style={{ color: amountColor }}
                  >
                    ₹{item.amount}
                  </Text>
                </View>

                {/* Bottom row with date and transactionId */}
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {item.transactionId ?? 'Not available'}
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
