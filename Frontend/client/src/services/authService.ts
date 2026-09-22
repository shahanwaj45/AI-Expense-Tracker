import type { User } from "@/types";
import { authenticateUser } from "@/auth/demoAuth";

/**
 * Auth service abstraction.
 * Currently uses demo accounts; swap implementation for real API later.
 */
export function login(email: string, password: string): Promise<User | null> {
  // Simulate async API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(authenticateUser(email, password));
    }, 400);
  });
}

export function logout(): Promise<void> {
  return Promise.resolve();
}
