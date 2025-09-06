import { Link, Tabs } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { DebugHeaderButton } from '../../components/DebugHeaderButton';
import { useEffect } from 'react';
import { requestUserPermission, notificationListener } from '~/firebase/notificationService';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { CoinHeader } from '~/components/CoinHeader';
import { useUserStore } from '~/stores/useUserStore';
import HomeIcon from '~/assets/svgs/home';
import TopupIcon from '~/assets/svgs/topup';
import HistoryIcon from '~/assets/svgs/history';
import OrderIcon from '~/assets/svgs/order';

const NoRippleButton = ({ children, onPress, style }: any) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={style}>
    {children}
  </TouchableOpacity>
);

export default function TabLayout() {
  const { refreshCoins, coins } = useUserStore((state) => ({
    refreshCoins: state.refreshCoins,
    coins: state.coins,
  }));

  useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 5,
        },
        headerStyle: {
          backgroundColor: '#ff0033',
          elevation: 5,
        },
        headerTitleStyle: {
          fontSize: 20,
          color: 'white',
          fontWeight: 'bold',
        },
        tabBarLabelStyle: {
          color: 'black',
        },
        tabBarButton: (props) => <NoRippleButton {...props} />,
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleAlign: 'left',
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="top-up"
        options={{
          title: 'Top-Up',
          tabBarIcon: ({ color, size, focused }) => (
            <TopupIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
          headerTitleAlign: 'left',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transaction History',
          tabBarIcon: ({ color, size, focused }) => (
            <HistoryIcon color={color} width={size} height={size} focused={focused} />
          ),
          tabBarLabel: 'History',
          animation: 'shift',
          headerTitleAlign: 'left',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders History',
          tabBarIcon: ({ color, size, focused }) => (
            <OrderIcon color={color} width={size + 10} height={size} focused={focused} />
          ),
          tabBarLabel: 'Orders',
          animation: 'shift',
          headerTitleAlign: 'left',
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
