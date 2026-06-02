// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────
//  Interface
// ─────────────────────────────────────────────

interface IContributorNFT {
    function isContributor(address user) external view returns (bool);
    function nextTokenId()               external view returns (uint256);
}

// ─────────────────────────────────────────────
//  GovernanceVoting v2
//  ✦ 30 günlük deadline
//  ✦ Tüm paydaşların %51'i YES → kabul
//  ✦ Deadline dolarsa → otomatik RED
//  ✦ [A] Uygulama Logu — kim ne yaptı?
//  ✦ [B] Kabul İmzası  — kararı kabul ettim
// ─────────────────────────────────────────────

contract GovernanceVoting {

    IContributorNFT public nftContract;

    uint256 public constant VOTING_PERIOD = 30 days;
    uint256 public constant THRESHOLD_PCT = 51;   // tüm paydaşların %51'i

    // ── Proposal ─────────────────────────────
    struct Proposal {
        uint256 id;
        address proposer;
        string  description;
        uint256 yesVotes;
        uint256 noVotes;
        bool    finalized;
        bool    passed;
        uint256 createdAt;
        uint256 deadline;
        uint256 totalContributors; // oluşturulduğu andaki paydaş sayısı (snapshot)
    }

    // ── Implementation Log (Öneri A) ─────────
    struct ImplLog {
        address contributor;
        string  note;
        uint256 timestamp;
    }

    // ── Storage ──────────────────────────────
    Proposal[] public proposals;

    // Oy kayıtları
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteChoice; // true = YES

    // [B] Kabul İmzaları
    mapping(uint256 => mapping(address => bool)) public hasSigned;
    mapping(uint256 => address[])                private _signers;

    // [A] Uygulama Logları
    mapping(uint256 => ImplLog[]) private _implLogs;

    // ── Events ───────────────────────────────
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string  description,
        uint256 deadline,
        uint256 totalContributors
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool    support
    );
    event ProposalFinalized(
        uint256 indexed id,
        bool    passed,
        uint256 yesVotes,
        uint256 requiredVotes
    );
    event AcceptanceSigned(
        uint256 indexed proposalId,
        address indexed signer
    );
    event ImplementationLogged(
        uint256 indexed proposalId,
        address indexed contributor,
        string  note,
        uint256 timestamp
    );

    // ─────────────────────────────────────────
    constructor(address _nftContract) {
        nftContract = IContributorNFT(_nftContract);
    }

    modifier onlyContributor() {
        require(nftContract.isContributor(msg.sender), "Not a contributor");
        _;
    }

    // ─────────────────────────────────────────
    //  1. Öneri Oluştur
    // ─────────────────────────────────────────

    /**
     * @notice Yeni bir oylama önerisi oluşturur.
     *         Paydaşların %51'i 30 gün içinde YES oyu vermezse otomatik RED.
     */
    function createProposal(string memory description) external onlyContributor {
        require(bytes(description).length > 0, "Description required");

        // Anlık paydaş sayısını snapshot'la (nextTokenId = toplam mint edilen NFT)
        uint256 total = nftContract.nextTokenId();
        require(total > 0, "No contributors registered");

        uint256 id       = proposals.length;
        uint256 deadline = block.timestamp + VOTING_PERIOD;

        proposals.push(Proposal({
            id:                id,
            proposer:          msg.sender,
            description:       description,
            yesVotes:          0,
            noVotes:           0,
            finalized:         false,
            passed:            false,
            createdAt:         block.timestamp,
            deadline:          deadline,
            totalContributors: total
        }));

        emit ProposalCreated(id, msg.sender, description, deadline, total);
    }

    // ─────────────────────────────────────────
    //  2. Oy Kullan
    // ─────────────────────────────────────────

    /**
     * @notice YES veya NO oyu kullan.
     *         Eşik anında dolunca öneri otomatik kabul edilir.
     */
    function castVote(uint256 proposalId, bool support) external onlyContributor {
        require(proposalId < proposals.length,         "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(!p.finalized,                          "Already finalized");
        require(block.timestamp <= p.deadline,         "Voting period ended");
        require(!hasVoted[proposalId][msg.sender],     "Already voted");

        hasVoted[proposalId][msg.sender]   = true;
        voteChoice[proposalId][msg.sender] = support;

        if (support) { p.yesVotes++; } else { p.noVotes++; }

        emit Voted(proposalId, msg.sender, support);

        // Eşik doldu mu? → Anında onayla
        uint256 required = _threshold(p.totalContributors);
        if (p.yesVotes >= required) {
            _finalize(proposalId, true);
        }
    }

    // ─────────────────────────────────────────
    //  3. Deadline Sonrası Sonuçlandır
    // ─────────────────────────────────────────

    /**
     * @notice 30 günlük süre bittikten sonra herhangi bir paydaş çağırabilir.
     *         Eşiğe ulaşılamamışsa öneri RED olarak kapanır.
     */
    function finalizeExpired(uint256 proposalId) external onlyContributor {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(!p.finalized,                  "Already finalized");
        require(block.timestamp > p.deadline,  "Voting still active");

        // Deadline dolduysa → her zaman RED
        _finalize(proposalId, false);
    }

    // ─────────────────────────────────────────
    //  4. [B] Kabul İmzası
    // ─────────────────────────────────────────

    /**
     * @notice Onaylanmış bir öneriyi kabul ettiğini blockchain'e imzala.
     */
    function signAcceptance(uint256 proposalId) external onlyContributor {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(p.finalized && p.passed,               "Proposal not passed");
        require(!hasSigned[proposalId][msg.sender],    "Already signed");

        hasSigned[proposalId][msg.sender] = true;
        _signers[proposalId].push(msg.sender);

        emit AcceptanceSigned(proposalId, msg.sender);
    }

    // ─────────────────────────────────────────
    //  5. [A] Uygulama Logu Ekle
    // ─────────────────────────────────────────

    /**
     * @notice Onaylanmış bir karar için ne yaptığını blockchain'e yaz.
     *         Herhangi bir paydaş, istediği kadar log ekleyebilir.
     */
    function addImplementationLog(uint256 proposalId, string memory note)
        external
        onlyContributor
    {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(p.finalized && p.passed, "Proposal not passed");
        require(bytes(note).length > 0,  "Note required");
        require(bytes(note).length <= 1000, "Note too long (max 1000 chars)");

        _implLogs[proposalId].push(ImplLog({
            contributor: msg.sender,
            note:        note,
            timestamp:   block.timestamp
        }));

        emit ImplementationLogged(proposalId, msg.sender, note, block.timestamp);
    }

    // ─────────────────────────────────────────
    //  View Functions
    // ─────────────────────────────────────────

    function getProposal(uint256 id)
        external view
        returns (
            address proposer,
            string  memory description,
            uint256 yesVotes,
            uint256 noVotes,
            bool    finalized,
            bool    passed,
            uint256 createdAt,
            uint256 deadline,
            uint256 totalContributors
        )
    {
        require(id < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[id];
        return (
            p.proposer, p.description,
            p.yesVotes, p.noVotes,
            p.finalized, p.passed,
            p.createdAt, p.deadline,
            p.totalContributors
        );
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /// @notice Öneriyi onaylamak için gereken minimum YES oyu
    function getRequiredVotes(uint256 proposalId) external view returns (uint256) {
        require(proposalId < proposals.length, "Invalid proposal");
        return _threshold(proposals[proposalId].totalContributors);
    }

    /// @notice Kalan oylama süresi (saniye). Süresi geçmişse 0.
    function timeLeft(uint256 proposalId) external view returns (uint256) {
        if (proposalId >= proposals.length) return 0;
        uint256 dl = proposals[proposalId].deadline;
        if (block.timestamp >= dl) return 0;
        return dl - block.timestamp;
    }

    /// @notice hasVoted alias (frontend uyumluluğu)
    function hasVotedOnProposal(uint256 proposalId, address user) external view returns (bool) {
        return hasVoted[proposalId][user];
    }

    function getVoteChoice(uint256 proposalId, address user) external view returns (bool) {
        return voteChoice[proposalId][user];
    }

    // ── [B] İmza görünümü ──────────────────

    function getSigners(uint256 proposalId) external view returns (address[] memory) {
        return _signers[proposalId];
    }

    function getSignerCount(uint256 proposalId) external view returns (uint256) {
        return _signers[proposalId].length;
    }

    // ── [A] Log görünümü ───────────────────

    function getImplementationLogs(uint256 proposalId)
        external view
        returns (
            address[] memory contributors,
            string[]  memory notes,
            uint256[] memory timestamps
        )
    {
        ImplLog[] storage logs = _implLogs[proposalId];
        uint256 len = logs.length;
        contributors = new address[](len);
        notes        = new string[](len);
        timestamps   = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            contributors[i] = logs[i].contributor;
            notes[i]        = logs[i].note;
            timestamps[i]   = logs[i].timestamp;
        }
    }

    function getImplementationLogCount(uint256 proposalId) external view returns (uint256) {
        return _implLogs[proposalId].length;
    }

    // ─────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────

    function _finalize(uint256 proposalId, bool passed) internal {
        Proposal storage p = proposals[proposalId];
        p.finalized = true;
        p.passed    = passed;
        emit ProposalFinalized(
            proposalId,
            passed,
            p.yesVotes,
            _threshold(p.totalContributors)
        );
    }

    /// @dev Ceiling division: ceil(total * 51 / 100)
    function _threshold(uint256 total) internal pure returns (uint256) {
        return (total * THRESHOLD_PCT + 99) / 100;
    }
}
