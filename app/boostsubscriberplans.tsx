import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { SegmentedButtons, Button } from 'react-native-paper';
import { use, useEffect, useState } from 'react';
import { getAllBoostPlans } from '~/lib/api/boost-plan';
import { BoostPlan } from '~/types/entities';
import { createOrder } from '~/lib/api/purchase';
import { useUserStore } from '~/stores/useUserStore';
import { getStoredUserId } from '~/utils/device-info';
import Toast from 'react-native-toast-message';

export default function BoostSubscriberPlanModal() {
  const { channelUrl } = useLocalSearchParams();
  console.log('Boosting channel:', channelUrl);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await getAllBoostPlans();
        if (res?.success && res.data) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const filteredPlans = plans.filter((item) => {
    return item.subscribers && item.subscribers > 0;
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          title: 'Boost Channel Plans',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ff0033',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-center text-lg font-semibold">
                No subscriber plans available at the moment.
              </Text>
              <Text className="mt-2 text-center text-gray-600">
                Please check back later for new plans to boost your channel subscribers.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedPlan(item.id)}
              style={{
                padding: 16,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: selectedPlan === item.id ? '#4F46E5' : '#ccc',
                borderRadius: 8,
                backgroundColor: selectedPlan === item.id ? '#EEF2FF' : '#fff',
              }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
              <Text style={{ marginTop: 4, color: '#555' }}>{item.price} coins</Text>
              <Text style={{ marginTop: 4, color: '#555' }}>{item.duration} seconds</Text>
            </Pressable>
          )}
          ListFooterComponent={
            <View style={{ marginTop: 24 }}>
              {selectedPlan && (
                <Text style={{ marginBottom: 12, textAlign: 'center' }}>
                  Selected Plan: {plans.find((p) => p.id === selectedPlan)?.title}
                </Text>
              )}
              <Button
                mode="contained"
                disabled={!selectedPlan}
                onPress={async () => {
                  console.log('Selected:', selectedPlan);
                  if (!selectedPlan) return;
                  const userId = await getStoredUserId();
                  if (!userId) return;
                  const coins = useUserStore.getState().coins;
                  const plan = plans.find((p) => p.id === selectedPlan);
                  if (!plan) return;
                  if (coins < plan.price) {
                    Toast.show({
                      text1: 'Insufficient Coins',
                      text2: `You need ${plan.price - coins} more coins to boost this channel.`,
                      type: 'error',
                    });
                    return;
                  }
                  createOrder(
                    useUserStore.getState().userId || userId,
                    selectedPlan,
                    channelUrl as string
                  ).then((res) => {
                    if (res.success) {
                      useUserStore.getState().refreshCoins();
                      Toast.show({
                        text1: 'Order Created',
                        text2: res.data?.message,
                        type: 'success',
                      });
                    } else {
                      Toast.show({
                        text1: 'Failed to create order',
                        text2: res.error,
                        type: 'error',
                      });
                    }
                  });
                  router.back();
                }}>
                Next
              </Button>
            </View>
          }
        />
      )}
    </View>
  );
}
