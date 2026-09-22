import type { Transaction, UserRole } from "@/types";
import { studentTransactions } from "@/data/studentData";
import { professionalTransactions } from "@/data/professionalData";

/**
 * Expense service abstraction.
 * Currently returns mock data; swap for real API later.
 */
export function getTransactions(role: UserRole): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        role === "student" ? studentTransactions : professionalTransactions,
      );
    }, 100);
  });
}

export function addExpense(
  _role: UserRole,
  name: string,
  amount: number,
  _category?: string,
  _paymentMethod?: string,
): Promise<{ success: boolean }> {
  // Mock — just log and return success
  console.log(`[expenseService] addExpense: ${name} ₹${amount}`);
  return Promise.resolve({ success: true });
}
