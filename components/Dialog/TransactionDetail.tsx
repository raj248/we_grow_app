import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Dialog, Portal, Divider } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../nativewindui/Text';
import { Transaction } from '~/types/entities';

interface DialogProps {
  visible: boolean;
  transaction: Transaction | null;
  titleLabel?: string;
  onDismiss: () => void;
}

export default function TransactionDetailDialog({
  visible,
  transaction,
  onDismiss,
  titleLabel = 'Transaction Details',
}: DialogProps) {
  const [videoUrl, setVideoUrl] = useState('');

  if (!transaction) return null;

  const handleBoostClick = () => {
    router.push({ pathname: '/boostviewplans', params: { videoUrl } });
    setVideoUrl('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{titleLabel}</Dialog.Title>
        <Divider />
        <Dialog.Content style={{ paddingVertical: 8 }}>
          <ScrollView>
            <View style={styles.row}>
              <Text style={styles.label}>Source:</Text>
              <Text style={styles.value}>{transaction.source}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount:</Text>
              <Text
                style={[
                  styles.value,
                  { color: transaction.type === 'CREDIT' ? '#10b981' : '#ef4444' },
                ]}>
                ₹{transaction.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{transaction.status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{transaction.type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{transaction.transactionId ?? 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Created At:</Text>
              <Text style={styles.value}>{new Date(transaction.createdAt).toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Updated At:</Text>
              <Text style={styles.value}>{new Date(transaction.updatedAt).toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.value}>{transaction.userId}</Text>
            </View>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={[styles.button, styles.cancelButton]}
              labelStyle={styles.buttonLabel}>
              Close
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
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '500',
    color: '#555',
    flexShrink: 1,
  },
  value: {
    fontWeight: '600',
    color: '#111',
    flexShrink: 1,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 25,
    paddingVertical: 6,
  },
  boostButton: {
    backgroundColor: '#27a84a',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
