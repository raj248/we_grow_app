import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Text } from '../nativewindui/Text';
import { router } from 'expo-router';
import { TextInput } from 'react-native-paper';

export default function GetSubscribersBottomSheet({ setOpenSheet }: { setOpenSheet: (fn: () => void) => void }) {
  const bottomSheetModalRef = useSheetRef();
  const [channelUrl, setChannelUrl] = useState('');

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
      setChannelUrl(''); // Clear the URL when the sheet is closed
    }
  }, []);

  const handleBoostNow = () => {
    // Add your boost logic here, e.g., validate URL, make API call
    console.log('Boosting subscribers:', channelUrl);
    bottomSheetModalRef.current?.close();
  };


  return (
    <Sheet ref={bottomSheetModalRef} snapPoints={snapPoints}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Text variant={'heading'} className='mb-4 text-center'>Boost Subscribers</Text>
        <Text variant={'subhead'} className="mb-2 text-center">Get Real Subscribers on your channel using coins</Text>
        <Text className="mb-1 text-center">📄 Total Subcribers: 250</Text>
        {/* <Text className="mb-4 text-center">❓ MCQ Count: {test?.mcqCount}</Text> */}
        <TextInput
          label={"Channel URL"}
          value={channelUrl}
          onChange={(ev) => setChannelUrl(ev.nativeEvent.text)}
          mode='outlined'
          className="mb-4" />
        <TouchableOpacity
          onPress={() => {
            // Handle boost logic here
            bottomSheetModalRef.current?.close();
            handleBoostNow();
            router.push('/getsubscribersplans');
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

// keyboard avoiding view didn't work, so let's try another method. change the snap points of the bottom sheets when keyboard open or when the text input is in focus