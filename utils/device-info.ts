import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'crypto-js';

const USER_ID_KEY = 'USER_ID';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Base62 encode BigInt
const base62Encode = (num: bigint): string => {
  let str = '';
  const base = BigInt(62);
  while (num > 0n) {
    str = BASE62[Number(num % base)] + str;
    num = num / base;
  }
  return str || '0';
};

// Generate 8-character guest ID from device info
const generate8CharGuestId = async (salt = 'superSecretSalt'): Promise<string> => {
  const model = await DeviceInfo.getModel();
  const brand = await DeviceInfo.getBrand();
  const androidId = await DeviceInfo.getUniqueId();
  console.log(model, brand, androidId)

  const raw = `${model}-${brand}-${androidId}-${salt}`;
  const hashHex = CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);

  // Take first 12 hex chars = 48 bits
  const hexSegment = hashHex.slice(0, 12);
  const number = BigInt(`0x${hexSegment}`);
  const base62 = base62Encode(number).padStart(8, '0');

  return base62.slice(0, 8);
};

// Main getter with AsyncStorage cache
export const getOrCreateUserId = async (): Promise<string> => {
  const cached = await AsyncStorage.getItem(USER_ID_KEY);
  if (cached) return cached;

  const id = await generate8CharGuestId();
  setStoredUserId(id);
  return id;
};

export async function getStoredUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_ID_KEY);
}

export async function setStoredUserId(id: string): Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, id);
}
