import { useAuth as useClerkAuth } from "@clerk/clerk-react";

const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

type SafeAuthReturn = {
  userId: string | null | undefined;
  isLoaded: boolean;
  getToken: () => Promise<string | null>;
};

export function useSafeAuth(): SafeAuthReturn {
  if (!CLERK_ENABLED) {
    return {
      userId: null,
      isLoaded: true,
      getToken: async () => null,
    };
  }
  
  try {
    const auth = useClerkAuth();
    return {
      userId: auth.userId,
      isLoaded: auth.isLoaded,
      getToken: auth.getToken,
    };
  } catch {
    return {
      userId: null,
      isLoaded: true,
      getToken: async () => null,
    };
  }
}
