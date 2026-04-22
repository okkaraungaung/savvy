import { createClient } from "./supabase/client";

const supabase = createClient();

export async function getCurrentScope() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, currentGroupId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    currentGroupId: profile?.current_group_id || null,
  };
}
