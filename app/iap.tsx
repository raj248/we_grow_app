import {
  useIAP,
  ErrorCode,
  Purchase,
  ExpoPurchaseError,
  finishTransaction,
  getAvailablePurchases,
  PurchaseError,
} from 'expo-iap';
import { useEffect } from 'react';
import { Alert, View } from 'react-native';
import { Button } from '~/components/Button';
import { Text } from '~/components/nativewindui/Text';
import { handlePurchaseError, validateReceipt } from '~/lib/api/purchase';
const androidProductIds = ['coin_10', 'coin_100'];

export default function IAPScreen() {
  // const { connected, products, fetchProducts, requestPurchase } = useIAP();
  const { connected, products, fetchProducts, requestPurchase } = useIAP({
    onPurchaseSuccess: (purchase) => {
      console.log('Purchase successful:', purchase);
      handleSuccessfulPurchase(purchase);
    },
    onPurchaseError: (error) => {
      console.error('Purchase failed:', error);
      handlePurchaseError(error as PurchaseError);
    },
  });

  useEffect(() => {
    if (connected) {
      // Fetch products and subscriptions
      fetchProducts({
        skus: androidProductIds,
        type: 'all',
      });

      getAvailablePurchases().then((purchases) => {
        console.log('Available purchases:', purchases);
      });
    }
  }, [connected]);

  return (
    <View>
      <Button title={`Connected: ${connected}`} onPress={() => {}} />
      <Text>Products: {JSON.stringify(products)}</Text>
      {/* Render products */}
      {products.map((product) => (
        <Button
          key={product.id}
          title={`Buy ${product.title} for ${product.displayPrice} and get ${product.description}`}
          onPress={() =>
            requestPurchase({ request: { android: { skus: [product.id] } }, type: 'in-app' })
          }
        />
      ))}
    </View>
  );
}
async function handleSuccessfulPurchase(purchase: Purchase) {
  console.log('Purchase details:', purchase);
  const isValid = await validateReceipt(purchase);
  if ((isValid.data as any).purchaseState === 0) {
    await finishTransaction({ purchase, isConsumable: true });
  }
  Alert.prompt('Purchase Successful', `You have successfully purchased ${purchase.productId}!`, [
    {
      text: 'OK',
      onPress: () => {
        // Optionally navigate or update UI after successful purchase
      },
    },
  ]);
}
