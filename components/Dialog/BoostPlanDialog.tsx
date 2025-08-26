import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Text } from '../nativewindui/Text';

interface DialogProps {
  visible: boolean;
  titleLabel?: string;
  inputLabel?: string;
  onDismiss: () => void;
}

export default function BoostPlanDialog({
  visible,
  onDismiss,
  titleLabel,
  inputLabel,
}: DialogProps) {
  const [videoUrl, setVideoUrl] = useState('');

  const handleClick = () => {
    router.push({ pathname: '/boostviewplans', params: { videoUrl } });
    setVideoUrl('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog} // custom rounded style
      >
        <Dialog.Title style={styles.title}>{titleLabel}</Dialog.Title>

        <Dialog.Content>
          <TextInput
            placeholder={inputLabel}
            value={videoUrl}
            mode="outlined"
            style={styles.input}
            onChangeText={setVideoUrl}
            theme={{ colors: { primary: '#ddd', outline: '#ddd' } }} // removes purple focus color
          />
        </Dialog.Content>

        <Dialog.Actions>
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              onPress={handleClick}
              style={[styles.button, styles.boostButton]}
              labelStyle={styles.buttonLabel}>
              Boost Video
            </Button>

            <Button
              mode="contained"
              onPress={onDismiss}
              style={[styles.button, styles.cancelButton]}
              labelStyle={styles.buttonLabel}>
              Cancel
            </Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
    paddingVertical: 1,
    backgroundColor: 'white',
  },
  title: {
    // fontWeight: 'bold',
    fontSize: 25,
    paddingBottom: 8,
  },
  input: {
    backgroundColor: '#f4f6fc', // light background like in screenshot
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  button: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 25,
    paddingVertical: 6,
    marginBottom: -8,
  },
  boostButton: {
    backgroundColor: '#27a84a',
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
