import { Link, Tabs } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { DebugHeaderButton } from '../../components/DebugHeaderButton';
import { useEffect } from 'react';
import { requestUserPermission, notificationListener } from '~/firebase/notificationService';
import { View } from 'react-native';
import { CoinHeader } from '~/components/CoinHeader';
import { useUserStore } from '~/stores/useUserStore';
import HomeIcon from '~/assets/svgs/home';
import TopupIcon from '~/assets/svgs/topup';
import HistoryIcon from '~/assets/svgs/history';
import OrderIcon from '~/assets/svgs/order';
export default function TabLayout() {
  const { refreshCoins, coins } = useUserStore((state) => ({
    refreshCoins: state.refreshCoins,
    coins: state.coins,
  }));

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
          headerTitleAlign: 'left', // 👈 this is the proper way
          headerStyle: {
            backgroundColor: '#ff0000',
          },
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
          tabBarLabelStyle: {
            color: 'black',
          },
          headerRight: () => (
            <View className="flex-row">
              <CoinHeader onPress={refreshCoins} coins={coins} />
              <Link href="/settings" asChild>
                <HeaderButton />
              </Link>
            </View>
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
          tabBarIcon: ({ color, size, focused }) => (
            <TopupIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
          headerTitleAlign: 'left', // 👈 this is the proper way
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#ff0000',
          },
          headerRight: () => (
            <View className="flex-row">
              <CoinHeader onPress={refreshCoins} coins={coins} />
              <Link href="/settings" asChild>
                <HeaderButton />
              </Link>
            </View>
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
          tabBarIcon: ({ color, size, focused }) => (
            <HistoryIcon color={color} width={size} height={size} focused={focused} />
          ),
          animation: 'shift',
          headerTitleAlign: 'left', // 👈 this is the proper way
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#ff0000',
          },
          headerRight: () => (
            <View className="flex-row">
              <CoinHeader onPress={refreshCoins} coins={coins} />
              <Link href="/settings" asChild>
                <HeaderButton />
              </Link>
            </View>
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
          tabBarIcon: ({ color, size, focused }) => (
            <OrderIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
          headerTitleAlign: 'left', // 👈 this is the proper way
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: {
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#ff0000',
          },
          headerRight: () => (
            <View className="flex-row">
              <CoinHeader onPress={refreshCoins} coins={coins} />
              <Link href="/settings" asChild>
                <HeaderButton />
              </Link>
            </View>
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

/**
 
import { Image } from "react-native";

<Tabs.Screen
  name="index"
  options={{
    title: "Home",
    headerTitleAlign: "left",
    tabBarIcon: ({ color, size, focused }) => (
      <Image
        source={require("../assets/icons/home.png")} // 👈 your image file
        style={{
          width: size,
          height: size,
          tintColor: focused ? "black" : "gray", // 👈 works if PNG has transparent background
        }}
        resizeMode="contain"
      />
    ),
  }}
/>


import HomeIcon from "../assets/icons/home.svg";

<Tabs.Screen
  name="index"
  options={{
    title: "Home",
    tabBarIcon: ({ color, size, focused }) => (
      <HomeIcon
        width={size}
        height={size}
        fill={focused ? "black" : "gray"} // change color dynamically
      />
    ),
  }}
/>



 */
