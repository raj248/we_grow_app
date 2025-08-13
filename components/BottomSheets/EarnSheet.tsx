import { useEffect } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';

export default function BoostViewBottomSheet({ setOpenSheet }: { setOpenSheet: (fn: () => void) => void }) {
  const bottomSheetModalRef = useSheetRef();

  useEffect(() => {
    if (setOpenSheet) setOpenSheet(() => () => bottomSheetModalRef.current?.present());
  }, [setOpenSheet]);

  return (
    <Sheet ref={bottomSheetModalRef} snapPoints={[60]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      </ScrollView>
    </Sheet>
  );
}
