import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

// ⚠️ هذا المفتاح يجب أن يكون مطابقاً للـ Backend
// في الإنتاج، استخدم Obfuscation لإخفائه
// ⚠️ MASKED FOR SECURITY - Choose a strong secret key for your production environment
const APP_SECRET = 'elite-app-secret-key-2026';

// API Configuration
// ⚠️ MASKED FOR SECURITY - Replace with your live Vercel base URL
const API_BASE = 'https://eliteapi.vercel.app';

const API_VERSION = 'api';
const API_URL = `${API_BASE}/${API_VERSION}`;

/**
 * توليد Device Fingerprint فريد
 */
const getDeviceFingerprint = async (): Promise<string> => {
  try {
    // محاولة الحصول على Device ID المحفوظ
    let deviceId = await AsyncStorage.getItem('device_fingerprint');

    if (!deviceId) {
      // توليد Device ID جديد
      const deviceInfo = {
        id: await Application.getAndroidId() || Device.modelId || 'unknown',
        brand: Device.brand || 'unknown',
        model: Device.modelName || 'unknown',
        os: Device.osName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
        timestamp: Date.now(),
      };

      deviceId = CryptoJS.SHA256(JSON.stringify(deviceInfo)).toString();

      // حفظه للاستخدام المستقبلي
      await AsyncStorage.setItem('device_fingerprint', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return 'fallback-device-id';
  }
};

/**
 * توقيع الطلب
 */
const signRequest = async (
  method: string,
  path: string,
  body: any
): Promise<{
  timestamp: number;
  signature: string;
  deviceFingerprint: string;
}> => {
  const timestamp = Date.now();
  const deviceFingerprint = await getDeviceFingerprint();

  // البيانات المراد توقيعها (يجب أن تطابق Backend)
  const dataToSign = `${method}|${path}|${timestamp}|${deviceFingerprint}|${JSON.stringify(body)}`;

  // التوقيع باستخدام HMAC-SHA256
  const signature = CryptoJS.HmacSHA256(dataToSign, APP_SECRET).toString();

  return {
    timestamp,
    signature,
    deviceFingerprint,
  };
};

/**
 * API Call آمن مع Request Signing
 */
export const secureApiCall = async (
  method: string,
  endpoint: string,
  data?: any,
  token?: string
): Promise<any> => {
  try {
    // توقيع الطلب
    const { timestamp, signature, deviceFingerprint } = await signRequest(
      method,
      endpoint,
      data || {}
    );

    // إعداد Headers
    const headers: any = {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature,
      'X-Device-ID': deviceFingerprint,
      'X-App-Version': Application.nativeApplicationVersion || '1.0.0',
    };

    // إضافة Token إذا كان موجوداً
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // إرسال الطلب
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    // معالجة الأخطاء
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // معالجة أخطاء محددة
      if (response.status === 403) {
        if (errorData.code === 'DEVICE_BLOCKED') {
          throw new Error('هذا الجهاز محظور. يرجى التواصل مع الدعم.');
        }
        if (errorData.code === 'INVALID_SIGNATURE') {
          throw new Error('خطأ في التحقق الأمني. يرجى تحديث التطبيق.');
        }
        if (errorData.code === 'REQUEST_EXPIRED') {
          throw new Error('انتهت صلاحية الطلب. يرجى المحاولة مرة أخرى.');
        }
      }

      if (response.status === 426) {
        throw new Error('يرجى تحديث التطبيق إلى أحدث إصدار.');
      }

      if (response.status === 429) {
        throw new Error('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
      }

      throw new Error(errorData.error || `خطأ في الاتصال: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('Secure API call error:', error);
    throw error;
  }
};

/**
 * دوال مساعدة للعمليات الشائعة
 */

export const secureGet = async (endpoint: string, token?: string) => {
  return secureApiCall('GET', endpoint, undefined, token);
};

export const securePost = async (endpoint: string, data: any, token?: string) => {
  return secureApiCall('POST', endpoint, data, token);
};

export const securePut = async (endpoint: string, data: any, token?: string) => {
  return secureApiCall('PUT', endpoint, data, token);
};

export const secureDelete = async (endpoint: string, token?: string) => {
  return secureApiCall('DELETE', endpoint, undefined, token);
};

/**
 * مثال على الاستخدام:
 * 
 * import { securePost } from './services/secureApi';
 * 
 * const login = async (email: string, password: string) => {
 *   const response = await securePost('/login', { email, password });
 *   return response;
 * };
 */
