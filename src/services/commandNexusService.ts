import { supabase, handleSupabaseError, OperationType } from '../supabase';

export interface CommandNexusUser {
  id: string;
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
  wallet_address?: string;
  user_id: string;
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
  user_id: string;
}

class CommandNexusService {
  async getUserData(uid: string): Promise<CommandNexusUser> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          coins: data.coins || 0,
          xp: data.xp || 0,
          level: data.level || 1,
          referrals: data.referrals || 0
        };
      }
      throw new Error('User not found');
    } catch (error) {
      handleSupabaseError(error, OperationType.GET, `users/${uid}`);
      throw error;
    }
  }

  async getCryptoAssets(uid: string): Promise<CryptoAsset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', uid);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Initialize default assets if none exist
        const defaults: Partial<CryptoAsset>[] = [
          { name: 'XRP', symbol: 'XRP', balance: '0.00', color: 'text-blue-400', icon: 'https://cryptologos.cc/logos/ripple-xrp-logo.png', change24h: 1.2, wallet_address: 'rPVMhWBmF9i3CNE9uS7LCNz4ecnYQH7iYF', user_id: uid },
          { name: 'Bitcoin', symbol: 'BTC', balance: '0.00', color: 'text-orange-400', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', change24h: -0.5, wallet_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', user_id: uid },
          { name: 'Solana', symbol: 'SOL', balance: '0.00', color: 'text-purple-400', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', change24h: 5.4, wallet_address: '7xKX99pZpY9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p', user_id: uid },
          { name: 'Stellar', symbol: 'XLM', balance: '0.00', color: 'text-gray-400', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png', change24h: 0.1, wallet_address: 'GA5ZSEJYB37JRC5AVCIAZ6Z3I3EX77M6S4S4S4S4S4S4S4S4S4S4S4S4', user_id: uid },
        ];
        
        const { data: inserted, error: insertError } = await supabase.from('assets').insert(defaults).select();
        if (insertError) throw insertError;
        return inserted as CryptoAsset[];
      }
      return data as CryptoAsset[];
    } catch (error) {
      handleSupabaseError(error, OperationType.GET, `users/${uid}/assets`);
      return [];
    }
  }

  async swapCoins(uid: string, amount: number, targetCrypto: string): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', uid)
        .single();

      if (userError || !user || (user.coins || 0) < amount) {
        return false;
      }

      // Simple mock rate: 100 coins = 1 unit of crypto (for demo)
      const cryptoGain = amount / 100;

      // Use RPC for atomic updates if possible, or transaction
      const { error: updateError } = await supabase.rpc('swap_coins_for_crypto', {
        user_id: uid,
        coin_amount: amount,
        crypto_symbol: targetCrypto,
        crypto_gain: cryptoGain
      });

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, `users/${uid}/swap`);
      return false;
    }
  }

  async getMissions(uid: string): Promise<Mission[]> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', uid);

      if (error) throw error;

      if (!data || data.length === 0) {
        const defaults: Partial<Mission>[] = [
          { title: 'Daily Login', description: 'Log in to the app today', reward: 10, type: 'daily', progress: 1, total: 1, completed: true, user_id: uid },
          { title: 'Watch 5 Videos', description: 'Watch 5 videos in the feed', reward: 25, type: 'daily', progress: 0, total: 5, completed: false, user_id: uid },
          { title: 'First Referral', description: 'Invite a friend to join', reward: 100, type: 'achievement', progress: 0, total: 1, completed: false, user_id: uid },
        ];

        const { data: inserted, error: insertError } = await supabase.from('missions').insert(defaults).select();
        if (insertError) throw insertError;
        return inserted as Mission[];
      }
      return data as Mission[];
    } catch (error) {
      handleSupabaseError(error, OperationType.GET, `users/${uid}/missions`);
      return [];
    }
  }

  async completeMission(uid: string, missionId: string): Promise<boolean> {
    try {
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();
      
      if (mission && !mission.completed) {
        const reward = mission.reward;
        
        const { error: updateError } = await supabase.rpc('complete_mission_and_reward', {
          user_id: uid,
          mission_id: missionId,
          reward_amount: reward,
          total_progress: mission.total
        });

        if (updateError) throw updateError;
        return true;
      }
      return false;
    } catch (error) {
      handleSupabaseError(error, OperationType.UPDATE, `users/${uid}/missions/${missionId}`);
      return false;
    }
  }

  async syncUser(uid: string, data: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          email: data.email,
          photo_url: data.photoURL,
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  async earnCoins(uid: string, amount: number, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_user_coins', {
        user_id: uid,
        amount: amount
      });
      return !error;
    } catch (error) {
      return false;
    }
  }

  async uploadFile(uid: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}/${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return URL.createObjectURL(file);
    }
  }

  async getWalletAddress(uid: string, symbol: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('wallet_address')
        .eq('user_id', uid)
        .eq('symbol', symbol)
        .single();

      if (error) throw error;
      return data?.wallet_address || 'Address not generated';
    } catch (error) {
      return 'Error fetching address';
    }
  }
}

export const commandNexusService = new CommandNexusService();
