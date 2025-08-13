import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Text } from '../nativewindui/Text';
import { router } from 'expo-router';
import { TextInput } from 'react-native-paper';

export default function BoostViewBottomSheet({ setOpenSheet }: { setOpenSheet: (fn: () => void) => void }) {
  const bottomSheetModalRef = useSheetRef();
  const [videoUrl, setVideoUrl] = useState('');

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const snapPoints = useMemo(() => [isKeyboardVisible ? '70%' : '45%'], [isKeyboardVisible]);

  useEffect(() => {
    if (setOpenSheet) setOpenSheet(() => () => bottomSheetModalRef.current?.present());
    // handleSheetChanges(-1);    
  }, [setOpenSheet]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setVideoUrl(''); // Clear the URL when the sheet is closed
    }
  }, []);

  const handleBoostNow = () => {
    // Add your boost logic here, e.g., validate URL, make API call
    router.push({ pathname: '/boostviewplans', params: { videoUrl } });
    bottomSheetModalRef.current?.close();
  };

  return (
    <Sheet ref={bottomSheetModalRef} snapPoints={snapPoints}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Text variant={'heading'} className='mb-4 text-center'>Boost Views</Text>
        <Text variant={'subhead'} className="mb-2 text-center">Increase views on your videos using coins</Text>
        <Text className="mb-1 text-center">⏱ Total Time: 120 minutes</Text>
        <Text className="mb-1 text-center">📄 Total Views: 240</Text>
        {/* <Text className="mb-4 text-center">❓ MCQ Count: {test?.mcqCount}</Text> */}
        <TextInput
          label={"Youtube Video URL"}
          value={videoUrl}
          onChange={(ev) => setVideoUrl(ev.nativeEvent.text)}
          mode='outlined'
          className="mb-4" />
        {/* <TextInput
          label={"Number of Views"}
          value='100'
          mode='outlined'
          keyboardType='numeric'
          className="mb-4"
        /> */}
        {/* <TextInput
          label={"Time per View (seconds)"}
          value='60'
          mode='outlined'
          keyboardType='numeric'
          className="mb-4"
        /> */}
        {/* <View className="flex-row justify-between items-center mb-4">
          <Text variant={'subhead'}>Total Cost:</Text>
          <Text variant={'subhead'} className="font-bold">500 Coins</Text>
        </View> */}
        <TouchableOpacity
          onPress={() => {
            // Handle boost logic here
            bottomSheetModalRef.current?.close();
            handleBoostNow();
            handleSheetChanges(-1);
          }}
          className="bg-blue-600 rounded-lg p-4 mt-4"
        >
          <Text className="text-center text-white font-medium">Boost Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </Sheet>
  );
}
