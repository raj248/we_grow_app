import { FlatList, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useEffect, useState } from 'react';
import { Badge } from 'react-native-paper';
import { fetchTransactionHistory } from '~/lib/api';
import { getStoredUserId } from '~/utils/device-info'; // or wherever you defined it
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
        console.log(res.data)
        setHistory(res.data);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text variant="title1" className="mb-4 text-center">Order History</Text>

      {loading ? (
        <Text className="text-center mt-4">Loading...</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const statusLabel =
              item.status === 'PENDING' ? 'Pending' :
                item.status === 'SUCCESS' ? 'Completed' :
                  'Failed';

            const colorMap = {
              Pending: '#fbbf24',
              Completed: '#10b981',
              Failed: '#ef4444',
            };

            return (
              <Pressable
                onPress={() => console.log(`Pressed ${item.source}`)}
                className="p-4 bg-background rounded-xl mb-2 border border-border shadow-md"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text variant="title3">{item.source}</Text>
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
                </View>

                <Text className="text-sm text-muted-foreground">
                  Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
