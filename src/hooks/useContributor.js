import { useState, useEffect, useCallback } from "react";

export const useContributor = (account, readContracts) => {
  const [isContributor, setIsContributor] = useState(false);
  const [memberStats, setMemberStats]     = useState(null); // { hours, timestamp, role }
  const [tokenBalance, setTokenBalance]   = useState(0n);
  const [isAdmin, setIsAdmin]             = useState(false);
  const [loading, setLoading]             = useState(false);
  const [contributors, setContributors]   = useState([]);

  const fetchData = useCallback(async () => {
    if (!account || !readContracts?.nft) return;
    setLoading(true);
    try {
      const [contributor, engineOwner, tokenBal] = await Promise.all([
        readContracts.nft.isContributor(account),
        readContracts.engine.owner(),   // admin = MainEngine'in sahibi
        readContracts.token.balanceOf(account),
      ]);
      setIsContributor(contributor);
      setTokenBalance(tokenBal);
      setIsAdmin(engineOwner.toLowerCase() === account.toLowerCase());

      if (contributor) {
        const stats = await readContracts.nft.getMemberStats(account);
        setMemberStats({
          hours:     stats.totalHoursWorked,
          timestamp: stats.lastActivityTimestamp,
          role:      stats.role,
        });
      } else {
        setMemberStats(null);
      }

      // Fetch all contributors
      try {
        const list = await readContracts.engine.getContributorList();
        const contribData = await Promise.all(
          list.map(async (addr) => {
            try {
              const stats = await readContracts.nft.getMemberStats(addr);
              const bal   = await readContracts.token.balanceOf(addr);
              return {
                address:   addr,
                hours:     stats.totalHoursWorked,
                role:      stats.role,
                timestamp: stats.lastActivityTimestamp,
                balance:   bal,
              };
            } catch {
              return { address: addr, hours: 0n, role: "Bilinmiyor", timestamp: 0n, balance: 0n };
            }
          })
        );
        setContributors(contribData);
      } catch {
        setContributors([]);
      }
    } catch (e) {
      console.error("Contributor data fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [account, readContracts]);

  // Hesap değişince hemen sıfırla — flash önler
  useEffect(() => {
    if (!account) {
      setIsContributor(false);
      setIsAdmin(false);
      setMemberStats(null);
      setTokenBalance(0n);
      setContributors([]);
      setLoading(false);
    } else {
      setLoading(true); // fetch başlamadan önce loading=true
    }
  }, [account]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { isContributor, memberStats, tokenBalance, isAdmin, loading, contributors, refresh: fetchData };
};
