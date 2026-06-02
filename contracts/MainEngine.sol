// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// ─────────────────────────────────────────────
//  Interfaces
// ─────────────────────────────────────────────

interface IContributorNFT {
    function isContributor(address user) external view returns (bool);
    function getMemberStats(address user)
        external
        view
        returns (
            uint256 totalHoursWorked,
            uint256 lastActivityTimestamp,
            string memory role
        );
    function mintContributor(address to, string memory role) external;
    function updateActivity(address user, uint256 additionalHours) external;
    function nextTokenId() external view returns (uint256);
}

interface IEquityToken {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

// ─────────────────────────────────────────────
//  MainEngine
// ─────────────────────────────────────────────

contract MainEngine is Ownable {
    // ── External contracts ──────────────────
    IContributorNFT public nftContract;
    IEquityToken    public tokenContract;

    // ── Contributor tracking ─────────────────
    uint256 public contributorCount;
    address[] public contributorList;
    mapping(address => bool) public isContributorTracked;

    // ── Work items ───────────────────────────
    struct WorkItem {
        address submitter;
        string  description;
        uint256 hours;
        uint256 timestamp;
        uint256 approvalCount;
        bool    finalized;
        bool    approved;
    }

    WorkItem[] public workItems;
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    // ── Role multipliers (1-10, where 10 = 1.0x) ──
    struct RoleMultiplier {
        uint256 multiplier;
        bool    exists;
    }
    mapping(string => RoleMultiplier) public roleMultipliers;

    // ── Dividend distribution ────────────────
    uint256 public constant PRECISION = 1e18;
    uint256 public accDividendPerShare;
    uint256 public totalDistributed;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) private pendingRewardPool;

    // ── Events ───────────────────────────────
    event WorkSubmitted(
        uint256 indexed workId,
        address indexed submitter,
        uint256 hours,
        string  description
    );
    event WorkApproved(
        uint256 indexed workId,
        address indexed approver,
        uint256 approvalCount
    );
    event WorkFinalized(
        uint256 indexed workId,
        address indexed submitter,
        uint256 tokensEarned
    );
    event ContributorAdded(address indexed contributor, string role);
    event RoleMultiplierSet(string role, uint256 multiplier);
    event RevenueDeposited(address indexed depositor, uint256 amount);
    event DividendClaimed(address indexed claimer, uint256 amount);

    // ─────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────

    constructor(address _nftContract, address _tokenContract)
        Ownable(msg.sender)
    {
        nftContract   = IContributorNFT(_nftContract);
        tokenContract = IEquityToken(_tokenContract);
    }

    // ─────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────

    modifier onlyContributor() {
        require(nftContract.isContributor(msg.sender), "Not a contributor");
        _;
    }

    // ─────────────────────────────────────────
    //  Admin Functions
    // ─────────────────────────────────────────

    /**
     * @notice Add a new contributor. Mints NFT and registers internally.
     * @dev Owner calls this → NFT contract must allow this MainEngine to mintContributor.
     *      Make sure to call ContributorNFT.setEngine(address(this)) first.
     */
    function addContributor(address user, string memory role)
        external
        onlyOwner
    {
        require(!nftContract.isContributor(user), "Already a contributor");
        nftContract.mintContributor(user, role);

        if (!isContributorTracked[user]) {
            contributorList.push(user);
            isContributorTracked[user] = true;
            contributorCount++;
        }

        // Snapshot reward debt so new contributor doesn't claim past dividends
        rewardDebt[user] =
            (tokenContract.balanceOf(user) * accDividendPerShare) / PRECISION;

        emit ContributorAdded(user, role);
    }

    /**
     * @notice Set a multiplier for a role (1–10).
     *         1 → 0.1x,  5 → 0.5x,  10 → 1.0x
     */
    function setRoleMultiplier(string memory role, uint256 multiplier)
        external
        onlyOwner
    {
        require(multiplier >= 1 && multiplier <= 10, "Multiplier must be 1-10");
        roleMultipliers[role] = RoleMultiplier(multiplier, true);
        emit RoleMultiplierSet(role, multiplier);
    }

    /**
     * @notice Deposit ETH revenue into the dividend pool.
     */
    function depositRevenue() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        uint256 supply = tokenContract.totalSupply();
        require(supply > 0, "No tokens minted yet");

        accDividendPerShare += (msg.value * PRECISION) / supply;
        totalDistributed    += msg.value;

        emit RevenueDeposited(msg.sender, msg.value);
    }

    // ─────────────────────────────────────────
    //  Contributor Functions
    // ─────────────────────────────────────────

    /**
     * @notice Submit a work record.
     */
    function submitWork(uint256 hours, string memory description)
        external
        onlyContributor
    {
        require(hours > 0 && hours <= 720, "Hours must be 1-720");
        require(bytes(description).length > 0, "Description required");

        workItems.push(
            WorkItem({
                submitter:     msg.sender,
                description:   description,
                hours:         hours,
                timestamp:     block.timestamp,
                approvalCount: 0,
                finalized:     false,
                approved:      false
            })
        );

        emit WorkSubmitted(workItems.length - 1, msg.sender, hours, description);
    }

    /**
     * @notice Approve someone else's work. Auto-finalizes when threshold reached.
     */
    function approveWork(uint256 workId) external onlyContributor {
        require(workId < workItems.length, "Invalid work ID");
        WorkItem storage item = workItems[workId];

        require(!item.finalized,             "Already finalized");
        require(item.submitter != msg.sender, "Cannot approve own work");
        require(!hasApproved[workId][msg.sender], "Already approved");

        hasApproved[workId][msg.sender] = true;
        item.approvalCount++;

        emit WorkApproved(workId, msg.sender, item.approvalCount);

        // ≥51 % of other contributors (excluding submitter)
        uint256 others    = contributorCount > 1 ? contributorCount - 1 : 1;
        uint256 threshold = (others * 51 + 99) / 100; // ceiling division

        if (item.approvalCount >= threshold) {
            _finalizeWork(workId);
        }
    }

    // ─────────────────────────────────────────
    //  Dividend Claim
    // ─────────────────────────────────────────

    function claimDividend() external {
        _updateReward(msg.sender);
        uint256 reward = pendingRewardPool[msg.sender];
        require(reward > 0, "No rewards to claim");

        pendingRewardPool[msg.sender] = 0;
        rewardDebt[msg.sender] =
            (tokenContract.balanceOf(msg.sender) * accDividendPerShare) / PRECISION;

        (bool ok, ) = payable(msg.sender).call{value: reward}("");
        require(ok, "Transfer failed");

        emit DividendClaimed(msg.sender, reward);
    }

    // ─────────────────────────────────────────
    //  View Functions
    // ─────────────────────────────────────────

    function pendingRewards(address user) external view returns (uint256) {
        uint256 balance = tokenContract.balanceOf(user);
        if (balance == 0) return pendingRewardPool[user];

        uint256 accumulated = (balance * accDividendPerShare) / PRECISION;
        uint256 debt        = rewardDebt[user];
        uint256 unpaid      = accumulated > debt ? accumulated - debt : 0;
        return unpaid + pendingRewardPool[user];
    }

    function getWorkItem(uint256 workId)
        external
        view
        returns (
            address submitter,
            string  memory description,
            uint256 hours,
            uint256 timestamp,
            uint256 approvalCount,
            bool    finalized,
            bool    approved
        )
    {
        require(workId < workItems.length, "Invalid work ID");
        WorkItem storage item = workItems[workId];
        return (
            item.submitter,
            item.description,
            item.hours,
            item.timestamp,
            item.approvalCount,
            item.finalized,
            item.approved
        );
    }

    function getWorkItemCount()    external view returns (uint256) { return workItems.length; }
    function getContributorCount() external view returns (uint256) { return contributorCount; }
    function getContributorList()  external view returns (address[] memory) { return contributorList; }
    function getRoleMultiplier(string memory role) external view returns (uint256) {
        return roleMultipliers[role].exists ? roleMultipliers[role].multiplier : 10;
    }
    function hasUserApproved(uint256 workId, address user) external view returns (bool) {
        return hasApproved[workId][user];
    }

    // ─────────────────────────────────────────
    //  Internal Helpers
    // ─────────────────────────────────────────

    function _finalizeWork(uint256 workId) internal {
        WorkItem storage item = workItems[workId];
        item.finalized = true;
        item.approved  = true;

        (, , string memory role) = nftContract.getMemberStats(item.submitter);
        uint256 multiplier = roleMultipliers[role].exists
            ? roleMultipliers[role].multiplier
            : 10;

        // Tokens = hours × multiplier × 0.1 (in 18-decimal)
        uint256 tokensToMint = item.hours * multiplier * 1e17;

        tokenContract.mint(item.submitter, tokensToMint);
        nftContract.updateActivity(item.submitter, item.hours);

        emit WorkFinalized(workId, item.submitter, tokensToMint);
    }

    function _updateReward(address user) internal {
        uint256 balance = tokenContract.balanceOf(user);
        if (balance > 0) {
            uint256 accumulated = (balance * accDividendPerShare) / PRECISION;
            uint256 debt        = rewardDebt[user];
            if (accumulated > debt) {
                pendingRewardPool[user] += accumulated - debt;
            }
        }
        rewardDebt[user] =
            (tokenContract.balanceOf(user) * accDividendPerShare) / PRECISION;
    }

    // ─────────────────────────────────────────
    //  Receive ETH (fallback)
    // ─────────────────────────────────────────
    receive() external payable {}
}
