import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export type TransactionFilters = {
  type?: "expense" | "income" | "";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export function useTransactions(filters: TransactionFilters = {}) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const res = await api.get("/transactions", { params });
      if (res.data.success) {
        setData(res.data.data.items);
        setTotal(res.data.data.total);
        setPages(res.data.data.pages);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category, filters.search, filters.page, filters.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (txData: {
    name: string;
    amount: number;
    category: string;
    type: string;
    payment_method?: string;
    notes?: string;
  }) => {
    const res = await api.post("/transactions", txData);
    if (res.data.success) {
      await fetchTransactions();
      return res.data.data;
    }
    throw new Error(res.data.error?.message || "Failed to create transaction");
  };

  const deleteTransaction = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  return { data, total, pages, loading, error, refetch: fetchTransactions, createTransaction, deleteTransaction };
}
