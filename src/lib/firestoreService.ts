import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { ListingItem, AccountingTransaction, UserAccount } from '../types';

const ITEMS_COLLECTION = 'items';
const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';

// --- Items (Marketplace Listings) ---

export function subscribeToMarketplaceItems(
  onItemsChanged: (items: ListingItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, ITEMS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ListingItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onItemsChanged(items);
      },
      (err) => {
        console.warn('Firestore marketplace items listener fallback:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Error subscribing to Firestore items:', err);
    return () => {};
  }
}

export async function saveListingItemToFirestore(item: ListingItem): Promise<void> {
  try {
    const docRef = doc(db, ITEMS_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore save item error (offline fallback applied):', err);
    // Non-blocking so app keeps working even without write permissions
  }
}

export async function deleteListingItemFromFirestore(itemId: string): Promise<void> {
  try {
    const docRef = doc(db, ITEMS_COLLECTION, itemId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete item error:', err);
  }
}

// --- Transactions (Campus Accounting Ledger) ---

export function subscribeToTransactions(
  onTransactionsChanged: (txs: AccountingTransaction[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const txs: AccountingTransaction[] = [];
        snapshot.forEach((docSnap) => {
          txs.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onTransactionsChanged(txs);
      },
      (err) => {
        console.warn('Firestore transactions listener fallback:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Error subscribing to Firestore transactions:', err);
    return () => {};
  }
}

export async function saveTransactionToFirestore(tx: AccountingTransaction): Promise<void> {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, tx.id);
    await setDoc(docRef, {
      ...tx,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore save transaction error:', err);
  }
}

// --- User Profile ---

export async function saveUserProfileToFirestore(userId: string, profile: Partial<UserAccount>): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore save user profile error:', err);
  }
}
