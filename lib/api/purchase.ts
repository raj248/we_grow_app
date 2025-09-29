import {
  ErrorCode,
  finishTransaction,
  PurchaseAndroid,
  PurchaseError,
  requestPurchase,
} from 'expo-iap';
import Toast from 'react-native-toast-message';
import { safeFetch, BASE_URL } from '~/lib/api/api';
import { useUserStore } from '~/stores/useUserStore';
import { APIResponse } from '~/types/api';
import { PurchaseOption, Transaction, Wallet } from '~/types/entities';

interface PurchasePayload {
  userId: string;
  productId: string;
  purchaseToken: string;
}

type MakeOrderInput = {
  userId: string;
  planId: string;
  url: string;
};

type MakeOrderResponse = {
  success: boolean;
  message: string;
  order: {
    id: string;
    userId: string;
    planId: string;
    status: string;
    createdAt: string;
  };
  transaction: {
    id: string;
    userId: string;
    amount: number;
    type: string;
    source: string;
    status: string;
    transactionId: string;
    createdAt: string;
  };
  wallet: {
    id: string;
    userId: string;
    balance: number;
    updatedAt: string;
  };
};

export async function getAllPurchaseOptions(
  timestamp?: number
): Promise<APIResponse<PurchaseOption[]>> {
  const url = new URL(`${BASE_URL}/api/topup-options`);

  if (timestamp) {
    url.searchParams.set('timestamp', timestamp.toString());
  }

  return safeFetch(url.toString());
}

export async function makeTopup(
  payload: PurchasePayload
): Promise<APIResponse<{ wallet: Wallet; transaction: Transaction }>> {
  return safeFetch(`${BASE_URL}/api/wallet/topup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

// validateReciept
export async function validateReceipt(purchase: PurchaseAndroid): Promise<APIResponse<boolean>> {
  const { productId, purchaseToken, transactionId, packageNameAndroid } = purchase;
  const userId = useUserStore.getState().userId;

  if (!userId) Promise.reject('User not logged in');

  return safeFetch(`${BASE_URL}/api/topup-options/validate-receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, purchaseToken, transactionId, packageNameAndroid, userId }),
  });
}
// export  = async (receipt: string) => {}

export const createOrder = async (
  userId: string,
  planId: string,
  link: string
): Promise<APIResponse<MakeOrderResponse>> => {
  const url = `${BASE_URL}/api/order/`;
  console.log(`Creating order for ${userId} with plan ${planId} and video ${link}`);
  return safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, planId, link }),
  });
};

export async function handlePurchase(sku: string) {
  try {
    if (!sku) return;
    await requestPurchase({ request: { android: { skus: [sku] } }, type: 'in-app' });
  } catch (error) {
    handlePurchaseError(error as PurchaseError);
  }
}

export async function handlePurchaseError(error: PurchaseError) {
  switch (error.code) {
    case ErrorCode.UserCancelled:
      console.log('User canceled the purchase.');
      break;
    case ErrorCode.QueryProduct:
      console.log('The Item is currently not available:', error.message);
      Toast.show({ text1: 'Item is not available', text2: error.message, type: 'error' });
      break;
    case ErrorCode.ItemUnavailable:
      console.log('Item is unavailable.');
      Toast.show({ text1: 'Item is unavailable', type: 'error' });
      break;
    case ErrorCode.BillingUnavailable:
      console.log('Billing service is unavailable.');
      Toast.show({ text1: 'Billing service is unavailable', type: 'error' });
      break;
    case ErrorCode.DeveloperError:
      console.log('Developer error:', error.message);
      Toast.show({ text1: 'Developer error', text2: error.message, type: 'error' });
      break;
    case ErrorCode.NetworkError:
      console.log('Network error:', error.message);
      Toast.show({ text1: 'Network error', text2: error.message, type: 'error' });
      retryWithBackoff(async () => {
        await handlePurchase(error.productId ?? '');
      });
      break;
    case ErrorCode.PurchaseError:
      console.log('Purchases Error:', error.message);
      Toast.show({ text1: 'Purchases Error', text2: error.message, type: 'error' });
      break;
    case ErrorCode.AlreadyOwned:
      console.log('Purchase is being processed. Try again later.');
      Toast.show({ text1: 'Purchase is being processed', type: 'info' });
      break;
    case ErrorCode.ConnectionClosed:
      console.log('The connection was closed.');
      Toast.show({ text1: 'Connection closed', type: 'error' });
      break;
    case ErrorCode.Interrupted:
      console.log('The purchase was interrupted.');
      Toast.show({ text1: 'Purchase was interrupted', type: 'error' });
      break;
    case ErrorCode.ServiceError:
      console.log('The service encountered an error. Try again later.');
      Toast.show({ text1: 'Service error', text2: 'Try again later', type: 'error' });
      break;
    case ErrorCode.IapNotAvailable:
      console.log('IAP is not available on this devices.');
      Toast.show({ text1: 'IAP is not available', type: 'error' });
      break;
    case ErrorCode.UserError:
      console.log('User error: Please try again later.');
      Toast.show({ text1: 'User error', text2: 'Please try again later', type: 'error' });
      break;
    case ErrorCode.Pending:
      console.log('Purchase is pending. Please wait for it to complete.');
      Toast.show({
        text1: 'Purchase is pending',
        text2: 'Please wait for it to complete.',
        type: 'info',
      });
      break;
    case ErrorCode.Unknown:
      console.log('An unknown error occurred. Please try again later');
      Toast.show({ text1: 'Unknown error', text2: 'Please try again later', type: 'error' });
      break;
    case ErrorCode.TransactionValidationFailed:
      console.log('The transaction could not be validated.');
      Toast.show({ text1: 'Transaction validation failed', type: 'error' });
      break;
    default:
      console.log('Unhandled purchase error:', error.code, error.message);
      Toast.show({ text1: 'Unhandled purchase error', text2: error.message, type: 'error' });
      break;
  }
}
export async function processPurchase(purchase: PurchaseAndroid) {
  if (!purchase) return;
  if (purchase.purchaseState === 'purchased') {
    const isValid = await validateReceipt(purchase);
    if ((isValid.data as any).purchaseState === 0) {
      useUserStore.getState().refreshCoins();
      await finishTransaction({ purchase, isConsumable: true });
    } else {
      console.log('Invalid Receipt.');
    }
  }
}

const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: ErrorCode | any) {
      if (i === maxRetries - 1) throw error;

      // Only retry on network or temporary errors
      if ([ErrorCode.ServiceError, ErrorCode.NetworkError].includes(error.code)) {
        console.log(`Retrying in ${Math.pow(2, i) * 1000}ms...`);
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      } else {
        throw error;
      }
    }
  }
};
