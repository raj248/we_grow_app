import React from 'react';
import { Snackbar } from 'react-native-paper';
import { useSnackbarStore } from '~/stores/snackbar.store';

export function SnackbarProvider() {
  const { visible, message, duration, hideSnackbar } = useSnackbarStore();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={duration}
      action={{
        label: 'OK',
        onPress: hideSnackbar,
      }}
    >
      {message}
    </Snackbar>
  );
}
