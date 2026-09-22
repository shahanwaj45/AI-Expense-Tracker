import type { User, UserRole } from "@/types";

interface DemoAccount {
  email: string;
  password: string;
  user: User;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "student@demo.com",
    password: "student123",
    user: {
      id: "demo-student-001",
      email: "student@demo.com",
      name: "Aarav Rao",
      initials: "AR",
      role: "student",
    },
  },
  {
    email: "professional@demo.com",
    password: "professional123",
    user: {
      id: "demo-professional-001",
      email: "professional@demo.com",
      name: "Demo Professional",
      initials: "DP",
      role: "professional",
    },
  },
];

export function authenticateUser(
  email: string,
  password: string,
): User | null {
  const account = DEMO_ACCOUNTS.find(
    (a) =>
      a.email.toLowerCase() === email.toLowerCase() &&
      a.password === password,
  );
  return account ? { ...account.user } : null;
}

export function getDemoCredentials(): Array<{
  email: string;
  password: string;
  role: UserRole;
}> {
  return DEMO_ACCOUNTS.map((a) => ({
    email: a.email,
    password: a.password,
    role: a.user.role,
  }));
}
