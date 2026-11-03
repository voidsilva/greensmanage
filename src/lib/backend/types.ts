import type { BetView } from '@/lib/domain';
import type { BetStatus, Market } from '@/lib/supabase/database.types';

export type Profile = {
  id: string;
  email: string;
  name: string;
  startingBankroll: number;
  monthlyGoal: number;
  unitSize: number;
};

export type NewBetInput = {
  code: string;
  game: string;
  league: string;
  market: Market;
  odd: number;
  stake: number;
  status: BetStatus;
};

export type ProfileInput = Pick<Profile, 'name' | 'startingBankroll' | 'monthlyGoal' | 'unitSize'>;

export type AuthResult = { error?: string; notice?: string };

/**
 * Everything the app needs from storage + auth. Two implementations:
 * `supabase.ts` (production) and `demo.ts` (no database).
 */
export interface Backend {
  readonly mode: 'supabase' | 'demo';
  currentProfile(): Promise<Profile | null>;
  /** Bets placed since `from`, plus every still-pending bet. Newest first. */
  listBets(from: Date): Promise<BetView[]>;
  /** Settled profit of bets placed before `from`. */
  profitBefore(from: Date): Promise<number>;
  createBet(input: NewBetInput): Promise<{ id: string }>;
  /** Returns null when the bet does not exist, is not yours or is already settled. */
  settleBet(id: string, result: 'green' | 'red'): Promise<{ stake: number; odd: number } | null>;
  updateProfile(input: ProfileInput): Promise<void>;

  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(name: string, email: string, password: string): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<AuthResult>;
  updatePassword(password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}
