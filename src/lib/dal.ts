import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { backend, type Profile } from './backend';

/** Data Access Layer: the single place that turns the request into a user. */
export const getCurrentUser = cache(async (): Promise<Profile> => {
  const profile = await backend().currentProfile();
  if (!profile) redirect('/login');
  return profile;
});
