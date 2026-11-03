import 'server-only';
import { isDemo } from '@/lib/config';
import { demoBackend } from './demo';
import { supabaseBackend } from './supabase';
import type { Backend } from './types';

export const backend = (): Backend => (isDemo() ? demoBackend : supabaseBackend);
export type * from './types';
