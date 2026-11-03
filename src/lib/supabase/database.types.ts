/**
 * Mirrors supabase/migrations. Regenerate after schema changes with:
 *   npm run db:types
 */
export type BetStatus = 'pending' | 'green' | 'red';
export type Market = 'over_under' | 'btts' | 'match_result' | 'corners' | 'asian_handicap';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          starting_bankroll: number;
          monthly_goal: number;
          unit_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          starting_bankroll?: number;
          monthly_goal?: number;
          unit_size?: number;
        };
        Update: {
          name?: string;
          starting_bankroll?: number;
          monthly_goal?: number;
          unit_size?: number;
        };
        Relationships: [];
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          game: string;
          league: string;
          market: Market;
          odd: number;
          stake: number;
          status: BetStatus;
          placed_at: string;
          settled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          code: string;
          game: string;
          league?: string;
          market: Market;
          odd: number;
          stake: number;
          status?: BetStatus;
          placed_at?: string;
          settled_at?: string | null;
        };
        Update: { status?: BetStatus; settled_at?: string | null };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      profit_before: { Args: { p_from: string }; Returns: number };
    };
    Enums: { bet_status: BetStatus; market: Market };
    CompositeTypes: Record<never, never>;
  };
};
