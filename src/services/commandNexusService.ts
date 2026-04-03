import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  increment,
  serverTimestamp
} from 'firebase/firestore';

export interface CommandNexusUser {
  uid: string;
  coins: number;
  xp: number;
  level: number;
  referrals: number;
}

export interface CryptoAsset {
  name: string;
  symbol: string;
  balance: string;
  color: string;
  icon: string;
  change24h: number;
  walletAddress?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'weekly' | 'achievement';
  progress: number;
  total: number;
  completed: boolean;
  userId: string;
}

class CommandNexusService {
  async getUserData(uid: string): Promise<CommandNexusUser> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: data.uid,
          coins: data.coins || 0,
          xp: data.xp || 0,
          level: data.level || 1,
          referrals: data.referrals || 0
        };
      }
      throw new Error('User not found');
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      throw error;
    }
  }

  async getCryptoAssets(uid: string): Promise<CryptoAsset[]> {
    try {
      const assetsSnap = await getDocs(collection(db, 'users', uid, 'assets'));
      if (assetsSnap.empty) {
        // Initialize default assets if none exist
        const defaults: CryptoAsset[] = [
          { name: 'XRP', symbol: 'XRP', balance: '0.00', color: 'text-blue-400', icon: 'https://cryptologos.cc/logos/ripple-xrp-logo.png', change24h: 1.2, walletAddress: 'rPVMhWBmF9i3CNE9uS7LCNz4ecnYQH7iYF' },
          { name: 'Bitcoin', symbol: 'BTC', balance: '0.00', color: 'text-orange-400', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', change24h: -0.5, walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
          { name: 'Solana', symbol: 'SOL', balance: '0.00', color: 'text-purple-400', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', change24h: 5.4, walletAddress: '7xKX99pZpY9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p' },
          { name: 'Stellar', symbol: 'XLM', balance: '0.00', color: 'text-gray-400', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png', change24h: 0.1, walletAddress: 'GA5ZSEJYB37JRC5AVCIAZ6Z3I3EX77M6S4S4S4S4S4S4S4S4S4S4S4S4' },
        ];
        
        for (const asset of defaults) {
          await setDoc(doc(db, 'users', uid, 'assets', asset.symbol), asset);
        }
        return defaults;
      }
      return assetsSnap.docs.map(doc => doc.data() as CryptoAsset);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/assets`);
      return [];
    }
  }

  async swapCoins(uid: string, amount: number, targetCrypto: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const assetRef = doc(db, 'users', uid, 'assets', targetCrypto);
      
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists() || (userDoc.data().coins || 0) < amount) {
        return false;
      }

      // Simple mock rate: 100 coins = 1 unit of crypto (for demo)
      const cryptoGain = amount / 100;

      await updateDoc(userRef, {
        coins: increment(-amount)
      });

      await updateDoc(assetRef, {
        balance: increment(cryptoGain).toString()
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/swap`);
      return false;
    }
  }

  async getMissions(uid: string): Promise<Mission[]> {
    try {
      const missionsSnap = await getDocs(collection(db, 'users', uid, 'missions'));
      if (missionsSnap.empty) {
        const defaults: Partial<Mission>[] = [
          { title: 'Daily Login', description: 'Log in to the app today', reward: 10, type: 'daily', progress: 1, total: 1, completed: true },
          { title: 'Watch 5 Videos', description: 'Watch 5 videos in the feed', reward: 25, type: 'daily', progress: 0, total: 5, completed: false },
          { title: 'First Referral', description: 'Invite a friend to join', reward: 100, type: 'achievement', progress: 0, total: 1, completed: false },
        ];

        const missions: Mission[] = [];
        for (const m of defaults) {
          const missionRef = doc(collection(db, 'users', uid, 'missions'));
          const missionData = { ...m, id: missionRef.id, userId: uid } as Mission;
          await setDoc(missionRef, missionData);
          missions.push(missionData);
        }
        return missions;
      }
      return missionsSnap.docs.map(doc => doc.data() as Mission);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/missions`);
      return [];
    }
  }

  async completeMission(uid: string, missionId: string): Promise<boolean> {
    try {
      const missionRef = doc(db, 'users', uid, 'missions', missionId);
      const missionDoc = await getDoc(missionRef);
      
      if (missionDoc.exists() && !missionDoc.data().completed) {
        const reward = missionDoc.data().reward;
        await updateDoc(missionRef, { completed: true, progress: missionDoc.data().total });
        await updateDoc(doc(db, 'users', uid), { coins: increment(reward) });
        return true;
      }
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/missions/${missionId}`);
      return false;
    }
  }

  async syncUser(uid: string, data: any): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async earnCoins(uid: string, amount: number, reason: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        coins: increment(amount)
      });
      // Log transaction could be added here
      return true;
    } catch (error) {
      return false;
    }
  }

  async uploadFile(uid: string, file: File): Promise<string> {
    // In a real app, this would use Firebase Storage
    // For this environment, we use local URL as a placeholder but with a warning
    console.warn('Firebase Storage not configured. Using local URL.');
    return URL.createObjectURL(file);
  }

  async getWalletAddress(uid: string, symbol: string): Promise<string> {
    try {
      const assetDoc = await getDoc(doc(db, 'users', uid, 'assets', symbol));
      if (assetDoc.exists()) {
        return assetDoc.data().walletAddress || 'Address not generated';
      }
      return 'Asset not found';
    } catch (error) {
      return 'Error fetching address';
    }
  }
}

export const commandNexusService = new CommandNexusService();
