import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SegmentedButtons, Button } from 'react-native-paper';
import { useState } from 'react';

const plansData = {
  views: [
    { id: 'v1', label: '100 Views - 20 coins' },
    { id: 'v2', label: '250 Views - 45 coins' },
    { id: 'v3', label: '500 Views - 80 coins' },
  ],
  likes: [
    { id: 'l1', label: '50 Likes - 30 coins' },
    { id: 'l2', label: '150 Likes - 60 coins' },
    { id: 'l3', label: '300 Likes - 110 coins' },
  ],
};

export default function BoostViewPlanModal() {
  const [tab, setTab] = useState<'views' | 'likes'>('views');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = plansData[tab];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: 'Boost View Plans' }} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <SegmentedButtons
            value={tab}
            onValueChange={(v) => {
              setTab(v as 'views' | 'likes');
              setSelectedPlan(null); // reset selection on tab change
            }}
            buttons={[
              { value: 'views', label: 'Views' },
              { value: 'likes', label: 'Likes' },
            ]}
            style={{ marginBottom: 16 }}
          />
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
            }}
          >
            <Text>{item.label}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={{ marginTop: 24 }}>
            {selectedPlan && (
              <Text style={{ marginBottom: 12, textAlign: 'center' }}>
                Selected Plan: {plans.find((p) => p.id === selectedPlan)?.label}
              </Text>
            )}
            <Button
              mode="contained"
              disabled={!selectedPlan}
              onPress={() => {
                // Navigate or trigger next action
                console.log('Selected:', selectedPlan);
              }}
            >
              Next
            </Button>
          </View>
        }
      />
    </View>
  );
}
