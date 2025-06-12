import { supabase } from "@/config/db";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return { supabase };
  },
});
