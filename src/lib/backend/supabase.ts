import 'server-only';
import { siteUrl } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import type { Backend } from './types';

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.',
  user_already_exists: 'Já existe uma conta com esse e-mail.',
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres com letras e números.',
  over_request_rate_limit: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  over_email_send_rate_limit: 'Muitos e-mails enviados. Espere alguns minutos.',
  same_password: 'A nova senha precisa ser diferente da atual.',
};
const authError = (e: { code?: string; message: string } | null) =>
  e
    ? { error: (e.code && AUTH_ERRORS[e.code]) || 'Não foi possível concluir. Tente de novo.' }
    : {};

export const supabaseBackend: Backend = {
  mode: 'supabase',

  async currentProfile() {
    const sb = await createClient();
    const { data: claims } = await sb.auth.getClaims();
    const uid = claims?.claims?.sub;
    if (!uid) return null;
    const { data: p } = await sb
      .from('profiles')
      .select('id, name, starting_bankroll, monthly_goal, unit_size')
      .eq('id', uid)
      .single();
    if (!p) return null;
    return {
      id: p.id,
      email: String(claims.claims.email ?? ''),
      name: p.name,
      startingBankroll: Number(p.starting_bankroll),
      monthlyGoal: Number(p.monthly_goal),
      unitSize: Number(p.unit_size),
    };
  },

  async listBets(from) {
    const sb = await createClient();
    const { data, error } = await sb
      .from('bets')
      .select('id, code, game, league, market, odd, stake, status, placed_at')
      .or(`placed_at.gte.${from.toISOString()},status.eq.pending`)
      .order('placed_at', { ascending: false })
      .limit(2000);
    if (error) throw error;
    return data.map((b) => ({
      id: b.id,
      code: b.code,
      game: b.game,
      league: b.league,
      market: b.market,
      odd: Number(b.odd),
      stake: Number(b.stake),
      status: b.status,
      placedAt: b.placed_at,
    }));
  },

  async profitBefore(from) {
    const sb = await createClient();
    const { data, error } = await sb.rpc('profit_before', { p_from: from.toISOString() });
    if (error) throw error;
    return Number(data ?? 0);
  },

  async createBet(input) {
    const sb = await createClient();
    const { data, error } = await sb
      .from('bets')
      .insert({
        ...input,
        settled_at: input.status === 'pending' ? null : new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return data;
  },

  async settleBet(id, result) {
    const sb = await createClient();
    const { data } = await sb
      .from('bets')
      .update({ status: result, settled_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select('stake, odd')
      .maybeSingle();
    return data ? { stake: Number(data.stake), odd: Number(data.odd) } : null;
  },

  async updateProfile(input) {
    const sb = await createClient();
    const { data: claims } = await sb.auth.getClaims();
    const uid = claims?.claims?.sub;
    if (!uid) throw new Error('unauthenticated');
    const { error } = await sb
      .from('profiles')
      .update({
        name: input.name,
        starting_bankroll: input.startingBankroll,
        monthly_goal: input.monthlyGoal,
        unit_size: input.unitSize,
      })
      .eq('id', uid);
    if (error) throw error;
  },

  async signIn(email, password) {
    const sb = await createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return authError(error);
  },

  async signUp(name, email, password) {
    const sb = await createClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${siteUrl()}/auth/confirm?next=/` },
    });
    if (error) return authError(error);
    // With e-mail confirmation on, there is no session until the link is clicked.
    return data.session
      ? {}
      : { notice: 'Conta criada. Enviamos um link de confirmação para o seu e-mail.' };
  },

  async requestPasswordReset(email) {
    const sb = await createClient();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/confirm?next=/nova-senha`,
    });
    // Same answer whether or not the e-mail exists (no account enumeration).
    if (error?.code?.startsWith('over_')) return authError(error);
    return {
      notice: 'Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.',
    };
  },

  async updatePassword(password) {
    const sb = await createClient();
    const { error } = await sb.auth.updateUser({ password });
    return authError(error);
  },

  async signOut() {
    const sb = await createClient();
    await sb.auth.signOut();
  },
};
