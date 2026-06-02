import { useState, useEffect, useCallback } from "react";

export const useDividend = (account, readContracts) => {
  const [pendingRewards, setPendingRewards] = useState(0n);
  const [totalDistributed, setTotalDistributed] = useState(0n);
  const [loading, setLoading] = useState(false);

  const fetchDividend = useCallback(async () => {
    if (!account || !readContracts?.engine) return;
    setLoading(true);
    try {
      const [pending, total] = await Promise.all([
        readContracts.engine.pendingRewards(account),
        readContracts.engine.totalDistributed(),
      ]);
      setPendingRewards(pending);
      setTotalDistributed(total);
    } catch (e) {
      console.error("Dividend fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [account, readContracts]);

  useEffect(() => {
    fetchDividend();
  }, [fetchDividend]);

  return { pendingRewards, totalDistributed, loading, refresh: fetchDividend };
};
