/* Supabase Client Configuration */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
