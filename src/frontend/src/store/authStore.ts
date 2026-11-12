import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, UserRole } from "../backend.d";

interface AuthStore {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

// Sanitize profile for JSON storage (converts bigint to number)
function sanitizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    createdAt:
      typeof profile.createdAt === "bigint"
        ? (Number(profile.createdAt) as unknown as bigint)
        : profile.createdAt,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      login: (profile: UserProfile) => {
        const safe = sanitizeProfile(profile);
        set({
          user: safe,
          role: safe.role,
          isAuthenticated: true,
        });
      },
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "hologram-auth",
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
