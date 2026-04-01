import axios from 'axios';

const API_URL = import.meta.env.VITE_COMMAND_NEXUS_API_URL || 'https://internal-api.commandnexus.net/v1';
const APP_ID = 'utubechat_shell_01';

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
}

class CommandNexusService {
  private api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'X-Nexus-App-ID': APP_ID,
    },
  });

  private cacheKey = 'nexus_shadow_state';

  constructor() {
    // Interceptor for Graceful Degradation
    this.api.interceptors.response.use(
      (response) => {
        // Update shadow cache on successful GET requests
        if (response.config.method === 'get' && response.data) {
          this.updateShadowCache(response.config.url!, response.data);
        }
        return response;
      },
      (error) => {
        console.warn('Nexus connection issue:', error.message);
        if (error.response?.status >= 500 && error.config?.method !== 'get') {
          // Trigger custom event for UI to show "System Tuning"
          window.dispatchEvent(new CustomEvent('nexus_tuning_mode'));
        }
        
        // Try to return from shadow cache if it's a GET request
        if (error.config?.method === 'get') {
          const cachedData = this.getFromShadowCache(error.config.url!);
          if (cachedData) {
            console.log('Serving from Shadow Cache for:', error.config.url);
            return { data: cachedData, status: 200, statusText: 'OK', headers: {}, config: error.config };
          }
        }
        
        return Promise.reject(new Error('System Tuning in Progress'));
      }
    );
  }

  private updateShadowCache(url: string, data: any) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.cacheKey) || '{}');
      cache[url] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (e) {
      console.error('Shadow Cache Error:', e);
    }
  }

  private getFromShadowCache(url: string): any | null {
    try {
      const cache = JSON.parse(localStorage.getItem(this.cacheKey) || '{}');
      return cache[url]?.data || null;
    } catch (e) {
      return null;
    }
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async getUserData(uid: string): Promise<CommandNexusUser> {
    try {
      const response = await this.api.get(`/users/${uid}`);
      return response.data;
    } catch (error) {
      throw new Error('System Tuning in Progress');
    }
  }

  async getCryptoAssets(uid: string): Promise<CryptoAsset[]> {
    try {
      const response = await this.api.get(`/users/${uid}/assets`);
      return response.data;
    } catch (error) {
      // Fallback to mock data if even shadow cache fails
      return [
        { name: 'XRP', symbol: 'XRP', balance: '0.00', color: 'text-blue-400', icon: 'https://cryptologos.cc/logos/ripple-xrp-logo.png', change24h: 0 },
        { name: 'Bitcoin', symbol: 'BTC', balance: '0.00', color: 'text-orange-400', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', change24h: 0 },
        { name: 'Solana', symbol: 'SOL', balance: '0.00', color: 'text-purple-400', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', change24h: 0 },
        { name: 'Stellar', symbol: 'XLM', balance: '0.00', color: 'text-gray-400', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png', change24h: 0 },
      ];
    }
  }

  async swapCoins(uid: string, amount: number, targetCrypto: string): Promise<boolean> {
    try {
      const response = await this.api.post(`/users/${uid}/swap`, { amount, targetCrypto });
      return response.data.success;
    } catch (error) {
      throw new Error('System Tuning in Progress');
    }
  }

  async getMissions(uid: string): Promise<Mission[]> {
    try {
      const response = await this.api.get(`/users/${uid}/missions`);
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async completeMission(uid: string, missionId: string): Promise<boolean> {
    try {
      const response = await this.api.post(`/users/${uid}/missions/${missionId}/complete`);
      return response.data.success;
    } catch (error) {
      throw new Error('System Tuning in Progress');
    }
  }

  async syncUser(uid: string, data: any): Promise<boolean> {
    try {
      const response = await this.api.post(`/users/${uid}/sync`, data);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async earnCoins(uid: string, amount: number, reason: string): Promise<boolean> {
    try {
      const response = await this.api.post(`/users/${uid}/earn`, { amount, reason });
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async uploadFile(uid: string, file: File): Promise<string> {
    console.warn('File upload to CommandNexus is not implemented. Returning local URL.');
    return URL.createObjectURL(file);
  }

  async getWalletAddress(uid: string, symbol: string): Promise<string> {
    try {
      const response = await this.api.get(`/users/${uid}/wallet/${symbol}`);
      return response.data.address;
    } catch (error) {
      // Fallback for demo/dev
      const mockAddresses: Record<string, string> = {
        'XRP': 'rPVMhWBmF9i3CNE9uS7LCNz4ecnYQH7iYF',
        'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'SOL': '7xKX99pZpY9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p9p',
        'XLM': 'GA5ZSEJYB37JRC5AVCIAZ6Z3I3EX77M6S4S4S4S4S4S4S4S4S4S4S4S4',
      };
      return mockAddresses[symbol] || 'Address not available';
    }
  }
}

export const commandNexusService = new CommandNexusService();
