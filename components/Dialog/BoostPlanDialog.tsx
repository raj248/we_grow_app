import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function BoostPlanDialog({ visible, onDismiss }: DialogProps) {
  const [videoUrl, setVideoUrl] = useState('');

  const handleClick = () => {
    router.push({ pathname: '/boostviewplans', params: { videoUrl } });
    setVideoUrl('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Add Entry</Dialog.Title>
        <Dialog.Content>
          {/* videoUrl Input */}
          <TextInput
            label="Youtube Video videoUrl"
            value={videoUrl}
            mode="outlined"
            onChange={(ev) => {
              setVideoUrl(ev.nativeEvent.text);
              console.log(videoUrl);
            }}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleClick}>Boost Now</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
