import type { AIInsight, UserRole } from "@/types";
import { studentAIInsight } from "@/data/studentData";
import { professionalAIInsight } from "@/data/professionalData";

/**
 * AI service abstraction.
 * Currently returns mock insights; swap for Gemini/OpenAI API later.
 */
export function getInsights(role: UserRole): Promise<AIInsight[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const insight =
        role === "student" ? studentAIInsight : professionalAIInsight;
      resolve([insight]);
    }, 200);
  });
}

export function getRecommendation(
  _role: UserRole,
  _context?: string,
): Promise<string> {
  return Promise.resolve(
    "Based on your recent spending patterns, consider setting aside ₹500 more per week toward your savings goal.",
  );
}
