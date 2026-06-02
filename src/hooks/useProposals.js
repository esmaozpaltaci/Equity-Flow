import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import GovernanceVoting_ABI  from "../contracts/GovernanceVoting.json";
import { GOVERNANCE_VOTING_ADDRESS } from "../contracts/addresses";

const ZERO = "0x0000000000000000000000000000000000000000";
export const isGovernanceDeployed = () => GOVERNANCE_VOTING_ADDRESS !== ZERO;

const getReadContract = () => {
  if (!isGovernanceDeployed() || !window.ethereum) return null;
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(GOVERNANCE_VOTING_ADDRESS, GovernanceVoting_ABI, provider);
};

export const getSignerContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask bulunamadı");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  return new ethers.Contract(GOVERNANCE_VOTING_ADDRESS, GovernanceVoting_ABI, signer);
};

export const useProposals = (account) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(false);

  const fetchProposals = useCallback(async () => {
    if (!isGovernanceDeployed()) return;
    const contract = getReadContract();
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.getProposalCount();
      const items = [];
      for (let i = 0n; i < count; i++) {
        const p = await contract.getProposal(i);

        let hasVoted = false, voteChoice = false, hasSigned = false;
        let requiredVotes = 1n, secsLeft = 0n;
        let implLogs = { contributors: [], notes: [], timestamps: [] };
        let signers  = [];

        if (account) {
          try {
            [hasVoted, requiredVotes, secsLeft] = await Promise.all([
              contract.hasVotedOnProposal(i, account),
              contract.getRequiredVotes(i),
              contract.timeLeft(i),
            ]);
            if (hasVoted) voteChoice = await contract.getVoteChoice(i, account);
            hasSigned = await contract.hasSigned(i, account);
          } catch {}
        }

        // Fetch logs and signers only for passed proposals
        if (p.finalized && p.passed) {
          try {
            [implLogs, signers] = await Promise.all([
              contract.getImplementationLogs(i),
              contract.getSigners(i),
            ]);
          } catch {}
        }

        // Kendi önergesine oy verememe kuralını dikkate alarak matematiksel olarak geçip geçemeyeceğini hesapla
        // Kalan potansiyel oylar = (Toplam Paydaş - 1 (Proposer)) - (Kullanılan Oylar)
        const totalC      = Number(p.totalContributors);
        const yesC        = Number(p.yesVotes);
        const noC         = Number(p.noVotes);
        const reqC        = Number(requiredVotes);
        
        const eligibleVoters = totalC > 1 ? totalC - 1 : 0;
        const uncastVotes    = eligibleVoters - (yesC + noC);
        const maxPossibleYes = yesC + uncastVotes;
        const mathematicallyFailed = !p.finalized && (maxPossibleYes < reqC);

        items.push({
          id:                i,
          proposer:          p.proposer,
          description:       p.description,
          yesVotes:          p.yesVotes,
          noVotes:           p.noVotes,
          finalized:         p.finalized || mathematicallyFailed,
          passed:            p.passed,
          mathematicallyFailed,
          createdAt:         p.createdAt,
          deadline:          p.deadline,
          totalContributors: p.totalContributors,
          requiredVotes,
          secsLeft,
          hasVoted,
          voteChoice,
          hasSigned,
          implLogs: {
            contributors: Array.from(implLogs.contributors || []),
            notes:        Array.from(implLogs.notes        || []),
            timestamps:   Array.from(implLogs.timestamps   || []),
          },
          signers: Array.from(signers || []),
        });
      }
      setProposals(items.reverse());
    } catch (e) {
      console.error("Proposals fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, loading, deployed: isGovernanceDeployed(), refresh: fetchProposals };
};
