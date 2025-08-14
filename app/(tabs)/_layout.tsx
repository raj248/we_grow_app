import { Link, Tabs } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { DebugHeaderButton } from '../../components/DebugHeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useEffect } from 'react';
import { requestUserPermission, notificationListener } from '~/firebase/notificationService';
import { useTrackActiveUser } from '~/lib/useTrackActiveUser';

export default function TabLayout() {
  useEffect(() => {
    // useTrackActiveUser()
    requestUserPermission();
    notificationListener();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/settings" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => (
            <Link href="/debug" asChild>
              <DebugHeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="top-up"
        options={{
          title: 'Top-up',
          tabBarIcon: ({ color }) => <TabBarIcon name="ticket" color={color} />,
          headerRight: () => (
            <Link href="/settings" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => (
            <Link href="/debug" asChild>
              <DebugHeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transaction History',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          headerRight: () => (
            <Link href="/settings" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => (
            <Link href="/debug" asChild>
              <DebugHeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
          headerRight: () => (
            <Link href="/settings" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => (
            <Link href="/debug" asChild>
              <DebugHeaderButton />
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
