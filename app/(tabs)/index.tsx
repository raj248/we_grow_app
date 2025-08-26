import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getOrCreateUserId } from '~/utils/device-info';
import { ProgressBar } from 'react-native-paper';
import { useTrackActiveUser } from '~/lib/useTrackActiveUser';
import { fetchWalletBalance } from '~/lib/api/api';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '~/stores/useUserStore';
import BoostViewBottomSheet from '~/components/BottomSheets/BoostViewBottomSheet';
import PromoteShortsBottomSheet from '~/components/BottomSheets/PromoteShortsBottomSheet';
import GetSubscribersBottomSheet from '~/components/BottomSheets/GetSubscribersBottomSheet';
import { router } from 'expo-router';
import BoostPlanDialog from '~/components/Dialog/BoostPlanDialog';
import { CardButton } from '~/components/CardButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';
const features = [
  {
    id: '4',
    title: 'Watch And Earn',
    inputLabel: '',
    description: 'Watch videos, reels and subscribe to channels to earn coins.',
    icon: require('~/assets/icons/earn.png'),
    border_color: '#9A1212',
    bg_color: '#FFDED7',
  },
  {
    id: '1',
    title: 'Boost Views',
    inputLabel: 'YouTube Video URL',
    description: 'Increase views on your videos using coins.',
    icon: require('~/assets/icons/boost_view.png'),
    border_color: '#69BA7F',
    bg_color: '#CDFFDC',
  },
  {
    id: '2',
    title: 'Get Subscribers',
    inputLabel: 'YouTube Channel URL',
    description: 'Gain real engagement via smart distribution.',
    icon: require('~/assets/icons/get_subscriber.png'),
    border_color: '#292966',
    bg_color: '#DEDEFF',
  },
  {
    id: '3',
    title: 'Promote Shorts',
    inputLabel: 'YouTube Video URL',
    description: 'Targeted exposure for YouTube Shorts.',
    icon: require('~/assets/icons/promote_shorts.png'),
    border_color: '#F57D02',
    bg_color: '#FFEED4',
  },
];

export default function Home() {
  useTrackActiveUser();
  const [id, setId] = useState('Loading...');
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [label, setLabel] = useState('');

  const { colors } = useColorScheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 2;

  const ITEM_HEIGHT = useMemo(() => {
    const verticalPadding = insets.top + insets.bottom + 90; // adjust if needed
    const rows = Math.ceil(features.length / numColumns);
    return (height - verticalPadding) / rows - 160;
  }, [height, width, insets, numColumns]);

  const loadData = useCallback(async () => {
    try {
      const userId = useUserStore.getState().userId || (await getOrCreateUserId());
      const res = await fetchWalletBalance(userId);
      if (res.success && res.data) {
        useUserStore.getState().setCoins(res.data.balance);
      }
    } catch (err) {
      setId(String(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={features}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={{
          backgroundColor: colors.background,
        }}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          return (
            <View style={{ flex: 1, margin: 8, height: ITEM_HEIGHT }}>
              <CardButton
                icon={item.icon}
                title={item.title}
                description={item.description}
                bgColor={item.bg_color}
                borderColor={item.border_color}
                onPress={() => {
                  if (item.id !== '4') {
                    setOpen(true);
                    setLabel(item.inputLabel);
                    setTitle(item.title);
                  } else router.push('/watch-and-earn-modal');
                }}
              />
            </View>
          );
        }}
      />
      <BoostPlanDialog
        visible={open}
        titleLabel={title}
        inputLabel={label}
        onDismiss={() => {
          setOpen(false);
        }}
      />
    </View>
  );
}
