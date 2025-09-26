import {
  useIAP,
  ErrorCode,
  Purchase,
  ExpoPurchaseError,
  finishTransaction,
  getAvailablePurchases,
} from 'expo-iap';
import { useEffect } from 'react';
import { Alert, View } from 'react-native';
import { Button } from '~/components/Button';
import { Text } from '~/components/nativewindui/Text';
import { validateReceipt } from '~/lib/api/purchase';
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
      handlePurchaseError(error);
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
      {/* connection status */}
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

function handlePurchaseError(error: ExpoPurchaseError) {
  if (error.code === ErrorCode.UserCancelled) {
    console.log('User canceled the purchase.');
    Alert.alert('Purchase Cancelled', 'You have canceled the purchase.');
  } else if (error.code === ErrorCode.DeferredPayment) {
    console.log('Payment is deferred (awaiting external action).');
    Alert.alert(
      'Payment Deferred',
      'Your payment is pending external action. Please check your app store subscriptions.'
    );
  } else if (error.code === ErrorCode.NetworkError) {
    console.log('Network error during purchase.');
    Alert.alert('Network Error', 'Please check your internet connection and try again.');
  } else if (error.code === ErrorCode.Pending) {
    console.log('Payment is pending.');
    Alert.alert(
      'Payment Pending',
      'Your payment is still pending. Please check your app store subscriptions or try again later.'
    );
  } else if (error.code === ErrorCode.ItemUnavailable) {
    console.log('Product is unavailable.');
    Alert.alert('Product Unavailable', 'The selected product is currently unavailable.');
  } else if (error.code === ErrorCode.IapNotAvailable) {
    console.log('Purchases are not allowed on this device.');
    Alert.alert(
      'Purchase Not Allowed',
      'Purchases are not allowed on this device or by this user account.'
    );
  } else if (error.code === ErrorCode.PurchaseError) {
    console.log('Invalid purchase request.');
    Alert.alert(
      'Purchase Invalid',
      'There was an issue with the purchase request. Please try again.'
    );
  } else {
    console.error('An unknown purchase error occurred:', error);
    Alert.alert('Purchase Error', 'An unknown error occurred during the purchase.');
  }
}
