import config from '../data/supabase.json';

/**
 * Supabase project backing the affiliate-link store ("Styled By Susanne").
 * The publishable key is designed to be public: reads are limited by RLS to
 * the affiliate_links table, and writes only happen through password-checked
 * database functions (see /admin). Values live in src/data/supabase.json so
 * the Node sync script can share them.
 */
export const SUPABASE_URL = config.url;
export const SUPABASE_PUBLISHABLE_KEY = config.publishableKey;
