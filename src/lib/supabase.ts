/**
 * Supabase placeholder for MVP.
 *
 * The first beta uses demoPlaces as the source of truth. When we move to a
 * server-backed catalog we wire the real client here. Until env vars are set,
 * `getSupabase()` returns null and callers fall back to demo data.
 */
import Constants from 'expo-constants';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const extra = Constants.expoConfig?.extra ?? {};
  const url = (extra.SUPABASE_URL as string | undefined) ?? '';
  const anonKey = (extra.SUPABASE_ANON_KEY as string | undefined) ?? '';
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
