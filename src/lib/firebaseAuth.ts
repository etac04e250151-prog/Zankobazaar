import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';
import { Language, UserAccount } from '../types';
import { UNIVERSITIES } from '../data/mockItems';

const PROFILE_STORAGE_PREFIX = 'zankobazaar_profile_';

export function getStoredProfile(uid: string): Partial<UserAccount> | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

export function saveStoredProfile(uid: string, profile: Partial<UserAccount>) {
  try {
    const existing = getStoredProfile(uid) || {};
    localStorage.setItem(
      `${PROFILE_STORAGE_PREFIX}${uid}`,
      JSON.stringify({ ...existing, ...profile })
    );
  } catch (e) {
    // ignore
  }
}

export function buildUserAccountFromFirebase(user: FirebaseUser, fallbackLanguage: Language = 'ku'): UserAccount {
  const extra = getStoredProfile(user.uid) || {};
  const defaultUni = UNIVERSITIES.find((u) => u.id === (extra.universityId || 'epu')) || UNIVERSITIES[0];

  const displayName = user.displayName || extra.name || (user.email ? user.email.split('@')[0] : 'قوتابی کەمپ');
  const avatar = user.photoURL || extra.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return {
    id: user.uid,
    name: displayName,
    email: user.email || extra.email || '',
    role: extra.role || 'student',
    universityId: extra.universityId || defaultUni.id,
    universityName: extra.universityName || defaultUni.name[fallbackLanguage] || defaultUni.name.en,
    department: extra.department || 'ئەندازیاری نەرمەکاڵا و ژمێریاری',
    studentIdNumber: extra.studentIdNumber || (user.email ? user.email.split('@')[0].toUpperCase() : `ID-${user.uid.slice(0, 6).toUpperCase()}`),
    phone: extra.phone || '+964 750 000 0000',
    whatsapp: extra.whatsapp || (extra.phone ? extra.phone.replace(/[^0-9]/g, '') : undefined),
    avatar,
    verifiedStudentId: extra.verifiedStudentId !== undefined ? extra.verifiedStudentId : true,
    joinedYear: extra.joinedYear || '2026',
    campusWalletBalanceIqd: extra.campusWalletBalanceIqd ?? 25000,
    campusWalletBalanceUsd: extra.campusWalletBalanceUsd ?? 17,
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: {
    name: string;
    universityId: string;
    universityName: string;
    department: string;
    role: UserAccount['role'];
    studentIdNumber: string;
    phone: string;
  },
  language: Language = 'ku'
): Promise<UserAccount> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Update Firebase User Profile display name
  if (profile.name) {
    try {
      await updateProfile(user, {
        displayName: profile.name,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
    } catch (e) {
      // non-fatal
    }
  }

  const extraData: Partial<UserAccount> = {
    id: user.uid,
    name: profile.name,
    email: user.email || email.trim(),
    role: profile.role,
    universityId: profile.universityId,
    universityName: profile.universityName,
    department: profile.department,
    studentIdNumber: profile.studentIdNumber,
    phone: profile.phone,
    whatsapp: profile.phone ? profile.phone.replace(/[^0-9]/g, '') : undefined,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verifiedStudentId: true,
    joinedYear: '2026',
    campusWalletBalanceIqd: 20000,
    campusWalletBalanceUsd: 13,
  };

  saveStoredProfile(user.uid, extraData);
  return buildUserAccountFromFirebase(user, language);
}

export async function signInWithEmail(email: string, password: string, language: Language = 'ku'): Promise<UserAccount> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return buildUserAccountFromFirebase(userCredential.user, language);
}

export async function signInWithGoogle(language: Language = 'ku'): Promise<UserAccount> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return buildUserAccountFromFirebase(result.user, language);
}

export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuthChanges(
  onUserChanged: (user: UserAccount | null) => void,
  language: Language = 'ku'
): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      onUserChanged(buildUserAccountFromFirebase(firebaseUser, language));
    } else {
      onUserChanged(null);
    }
  });
}

export function formatAuthError(error: any, language: Language): string {
  const code = (error as AuthError)?.code || '';

  const messages: Record<string, { ku: string; ar: string; en: string }> = {
    'auth/email-already-in-use': {
      ku: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە چوونەژوورەوە بکە.',
      ar: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.',
      en: 'This email is already in use. Please sign in instead.',
    },
    'auth/invalid-email': {
      ku: 'ئیمەیڵەکە شێوازی دروست نییە. نموونە: student@epu.edu.iq',
      ar: 'صيغة البريد الإلكتروني غير صحيحة. مثال: student@epu.edu.iq',
      en: 'Invalid email address format. Example: student@epu.edu.iq',
    },
    'auth/weak-password': {
      ku: 'وشەی تێپەڕ دەبێت لانیکەم ٦ پیت یان ژمارە بێت.',
      ar: 'كلمة المرور يجب أن تكون من 6 أحرف على الأقل.',
      en: 'Password should be at least 6 characters.',
    },
    'auth/wrong-password': {
      ku: 'وشەی تێپەڕ هەڵەیە. تکایە دڵنیابەرەوە.',
      ar: 'كلمة المرور غير صحيحة. يرجى التأكد.',
      en: 'Incorrect password. Please try again.',
    },
    'auth/user-not-found': {
      ku: 'هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە. تکایە سەرەتا هەژمار دروست بکە.',
      ar: 'لم يتم العثور على حساب بهذا البريد. يرجى التسجيل أولاً.',
      en: 'No user found with this email. Please register an account first.',
    },
    'auth/invalid-credential': {
      ku: 'ئیمەیڵ یان وشەی تێپەڕ هەڵەیە.',
      ar: 'بيانات الاعتماد غير صحيحة (البريد أو كلمة المرور).',
      en: 'Invalid email or password credentials.',
    },
    'auth/too-many-requests': {
      ku: 'هەوڵی زۆر لەم ئامێرەوە دراوە. کەمێکی تر دووبارەی بکەرەوە.',
      ar: 'تم حظر الحساب مؤقتاً لكثرة المحاولات. يرجى المحاولة بعد قليل.',
      en: 'Too many unsuccessful attempts. Access temporarily blocked. Try again later.',
    },
    'auth/network-request-failed': {
      ku: 'کێشەی هێڵی ئینتەرنێت هەیە. تکایە پەیوەندییەکەت بپشکنە.',
      ar: 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.',
      en: 'Network request failed. Please check your internet connection.',
    },
    'auth/operation-not-allowed': {
      ku: 'تکایە دڵنیابەرەوە کە ئەم شێوازەی چوونەژوورەوە لە Firebase Console کراوەتەوە.',
      ar: 'يرجى التأكد من تفعيل موفر تسجيل الدخول في لوحة Firebase Console.',
      en: 'Sign-in provider is not enabled in the Firebase Console.',
    },
    'auth/popup-closed-by-user': {
      ku: 'پەنجەرەی چوونەژوورەوەی گووگڵ لەلایەن بەکارهێنەرەوە داخرا.',
      ar: 'تم إغلاق نافذة تسجيل الدخول من قبل المستخدم.',
      en: 'Google sign-in popup was closed before completing.',
    },
    'auth/popup-blocked': {
      ku: 'پەنجەرەی پۆپ-ئەپ بلۆک کراوە. تکایە لە وێبگەڕەکەتدا ڕێگەی پێبدە.',
      ar: 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة في المتصفح.',
      en: 'Popup was blocked by the browser. Please allow popups.',
    },
    'auth/cancelled-popup-request': {
      ku: 'کرداری چوونەژوورەوە هەڵوەشێنرایەوە.',
      ar: 'تم إلغاء طلب تسجيل الدخول.',
      en: 'Sign-in request was cancelled.',
    },
  };

  if (code && messages[code]) {
    return messages[code][language] || messages[code].en;
  }

  if (error?.message) {
    return error.message;
  }

  return language === 'ku'
    ? 'هەڵەیەک لە چوونەژوورەوە ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.'
    : language === 'ar'
    ? 'حدث خطأ أثناء المصادقة. يرجى المحاولة مرة أخرى.'
    : 'Authentication failed. Please check your information and try again.';
}
