import { useState, useEffect, useCallback } from "react";

export const useWorkItems = (account, readContracts) => {
  const [workItems, setWorkItems]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [contribCount, setContribCount] = useState(0n);

  const fetchWorkItems = useCallback(async () => {
    if (!readContracts?.engine) return;
    setLoading(true);
    try {
      const [count, cCount] = await Promise.all([
        readContracts.engine.getWorkItemCount(),
        readContracts.engine.getContributorCount(),
      ]);
      setContribCount(cCount);

      const items = [];
      for (let i = 0n; i < count; i++) {
        try {
          const item = await readContracts.engine.getWorkItem(i);
          let hasApproved = false;
          if (account) {
            try {
              hasApproved = await readContracts.engine.hasUserApproved(i, account);
            } catch {}
          }
          items.push({
            id:            i,
            submitter:     item.submitter,
            description:   item.description,
            hours:         item.workHours,   // contract returns workHours
            timestamp:     item.timestamp,
            approvalCount: item.approvalCount,
            finalized:     item.finalized,
            approved:      item.approved,
            hasApproved,
          });
        } catch {}
      }
      setWorkItems(items.reverse()); // newest first
    } catch (e) {
      console.error("Work items fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [account, readContracts]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  return { workItems, loading, contribCount, refresh: fetchWorkItems };
};
