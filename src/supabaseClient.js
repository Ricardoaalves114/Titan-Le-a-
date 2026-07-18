import { createClient } from "@supabase/supabase-js";

// Public project URL and publishable key — safe to keep in client-side code
// as long as Row Level Security (RLS) policies are set on the tables.
const SUPABASE_URL = "https://givfjawgoiyvhjysgfle.supabase.co";
const SUPABASE_KEY = "sb_publishable_A7T4mN9fAfUGEfymC2VxDg_u4Gn_mDX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
