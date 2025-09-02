import { 
  type Purchase, 
  type InsertPurchase, 
  type PriceHistory, 
  type TokenStats,
  type User,
  type InsertUser 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getTokenStats(): Promise<TokenStats>;
  updateTokenStats(stats: Partial<TokenStats>): Promise<TokenStats>;
  getPriceHistory(limit?: number): Promise<PriceHistory[]>;
  addPriceHistory(price: number, changePercent: number): Promise<PriceHistory>;
  calculateNewPrice(currentPrice: number, purchaseAmount: number): Promise<number>;
  
  // User and referral methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  generateReferralCode(): Promise<string>;
  updateUserDepositStatus(email: string, hasDeposited: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private purchases: Map<string, Purchase>;
  private priceHistory: Map<string, PriceHistory>;
  private tokenStats: TokenStats;
  private users: Map<string, User>;

  constructor() {
    this.purchases = new Map();
    this.priceHistory = new Map();
    this.users = new Map();
    this.tokenStats = {
      id: randomUUID(),
      totalSupply: 600000000000,
      soldSupply: 271838183177,
      currentPrice: 17.0000,
      totalDividendsDistributed: 2847293.47,
      activeDividendHolders: 15847,
      updatedAt: new Date(),
    };

    // Initialize with some price history
    this.initializePriceHistory();
  }

  private initializePriceHistory() {
    const basePrice = 17.0000;
    const fluctuationRate = 0.000027;
    
    for (let i = 0; i < 24; i++) {
      const fluctuation = (Math.random() - 0.5) * fluctuationRate * 2;
      const price = basePrice + (basePrice * fluctuation);
      const changePercent = fluctuation * 100;
      
      const entry: PriceHistory = {
        id: randomUUID(),
        price,
        changePercent,
        timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000),
      };
      
      this.priceHistory.set(entry.id, entry);
    }
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);

    // Update token stats
    const newSoldSupply = this.tokenStats.soldSupply + Math.floor(insertPurchase.bdcAmount);
    const newPrice = await this.calculateNewPrice(this.tokenStats.currentPrice, insertPurchase.amount);
    
    this.tokenStats = {
      ...this.tokenStats,
      soldSupply: newSoldSupply,
      currentPrice: newPrice,
      updatedAt: new Date(),
    };

    return purchase;
  }

  async getTokenStats(): Promise<TokenStats> {
    return this.tokenStats;
  }

  async updateTokenStats(stats: Partial<TokenStats>): Promise<TokenStats> {
    this.tokenStats = {
      ...this.tokenStats,
      ...stats,
      updatedAt: new Date(),
    };
    return this.tokenStats;
  }

  async getPriceHistory(limit: number = 24): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values())
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async addPriceHistory(price: number, changePercent: number): Promise<PriceHistory> {
    const id = randomUUID();
    const entry: PriceHistory = {
      id,
      price,
      changePercent,
      timestamp: new Date(),
    };
    
    this.priceHistory.set(id, entry);
    return entry;
  }

  async calculateNewPrice(currentPrice: number, purchaseAmount: number): Promise<number> {
    const fluctuationRate = 0.000027; // 0.0027%
    const priceIncrease = currentPrice * fluctuationRate;
    return Math.max(currentPrice + priceIncrease, 0.01);
  }

  // User and referral methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.email!, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.get(email);
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.referralCode === referralCode) {
        return user;
      }
    }
    return undefined;
  }

  async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (await this.getUserByReferralCode(code));
    
    return code;
  }

  async updateUserDepositStatus(email: string, hasDeposited: boolean): Promise<void> {
    const user = this.users.get(email);
    if (user) {
      user.hasDeposited = hasDeposited ? "true" : "false";
      user.updatedAt = new Date();
      this.users.set(email, user);
    }
  }
}

export const storage = new MemStorage();
