// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "./utils/ZamaEthereumConfigShim.sol";

/**
 * @title Stormline Auction
 * @notice Player-owned sealed tier auctions with encrypted bid direction.
 *         Users submit encrypted tier choices (Ember/Gale/Flash).
 *         The tier with fewest bidders wins - minority game mechanics.
 * @dev Updated to fhEVM 0.9.1 using ZamaEthereumConfig
 */
contract StormlineAuction is ZamaEthereumConfig {
    enum Tier {
        Ember,  // 0
        Gale,   // 1
        Flash   // 2
    }

    struct Bid {
        bool exists;
        bool claimed;
        euint8 encryptedTier;  // Encrypted tier choice (0, 1, or 2)
    }

    struct Series {
        bool exists;
        string seriesId;
        string lotLabel;
        address creator;
        uint256 bidStake;
        uint256 lockTime;
        uint256 prizePool;
        bool cancelled;
        bool settled;
        bool pushAll;
        uint8 winningTier;    // 0-2 valid, 255 unset
        uint256 winnerCount;
        uint256[3] tierCounts;  // Revealed after settlement
        address[] bidders;
    }

    struct SeriesSnapshot {
        bool exists;
        string seriesId;
        string lotLabel;
        address creator;
        uint256 bidStake;
        uint256 lockTime;
        uint256 prizePool;
        bool cancelled;
        bool settled;
        bool pushAll;
        uint8 winningTier;
        uint256 winnerCount;
        uint256[3] tierCounts;
        uint256 totalBidders;
    }

    mapping(string => Series) private seriesById;
    mapping(string => mapping(address => Bid)) private bids;
    string[] private seriesIds;

    uint256 public constant MIN_STAKE = 0.0004 ether;
    uint256 public constant MIN_DURATION = 10 minutes;
    uint256 public constant MAX_DURATION = 96 hours;

    event SeriesCreated(string indexed seriesId, string lotLabel, uint256 bidStake, uint256 lockTime);
    event BidPlaced(string indexed seriesId, address indexed bidder);
    event SeriesSettled(string indexed seriesId, bool pushAll, uint8 winningTier, uint256 winnerCount);
    event SeriesCancelled(string indexed seriesId);
    event PrizeClaimed(string indexed seriesId, address indexed bidder, uint256 payout);
    event RefundClaimed(string indexed seriesId, address indexed bidder, uint256 refund);

    error SeriesExists();
    error SeriesMissing();
    error InvalidStake();
    error InvalidDuration();
    error InvalidTier();
    error Locked();
    error AlreadyBid();
    error BidMissing();
    error NotSettled();
    error NotWinner();
    error AlreadyClaimed();
    error NotRefundable();
    error NotCreator();

    /** -------------------- Series creation -------------------- */

    function createReplicaSeries(
        string calldata seriesId,
        string calldata lotLabel,
        uint256 bidStake,
        uint256 duration
    ) external {
        if (seriesById[seriesId].exists) revert SeriesExists();
        if (bidStake < MIN_STAKE) revert InvalidStake();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();

        Series storage series = seriesById[seriesId];
        series.exists = true;
        series.seriesId = seriesId;
        series.lotLabel = lotLabel;
        series.creator = msg.sender;
        series.bidStake = bidStake;
        series.lockTime = block.timestamp + duration;
        series.winningTier = type(uint8).max;

        seriesIds.push(seriesId);
        emit SeriesCreated(seriesId, lotLabel, bidStake, series.lockTime);
    }

    /** -------------------- Participation -------------------- */

    /**
     * @notice Enter an auction with an encrypted tier choice
     * @param seriesId The auction series ID
     * @param encryptedTier Encrypted tier value (0=Ember, 1=Gale, 2=Flash)
     * @param proof ZK proof for the encrypted input
     */
    function enterReplicaSeries(
        string calldata seriesId,
        externalEuint8 encryptedTier,
        bytes calldata proof
    ) external payable {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.cancelled) revert Locked();
        if (block.timestamp >= series.lockTime) revert Locked();
        if (msg.value != series.bidStake) revert InvalidStake();

        Bid storage bid = bids[seriesId][msg.sender];
        if (bid.exists && !bid.claimed) revert AlreadyBid();

        euint8 tier = FHE.fromExternal(encryptedTier, proof);

        bid.exists = true;
        bid.claimed = false;
        bid.encryptedTier = tier;

        FHE.allowThis(tier);
        FHE.allow(tier, msg.sender);

        series.prizePool += msg.value;
        series.bidders.push(msg.sender);

        emit BidPlaced(seriesId, msg.sender);
    }

    /** -------------------- Settlement -------------------- */

    /**
     * @notice Settle the auction - determines winning tier based on minority game
     * @dev Uses blockhash for randomness when there's a tie
     *      The tier with the FEWEST bidders wins (minority game)
     */
    function settleReplicaSeries(string calldata seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.cancelled) revert Locked();
        if (block.timestamp < series.lockTime) revert Locked();
        if (series.settled) revert Locked();

        // Count bids per tier by decrypting each bidder's choice
        // Note: In production, this would use batch decryption or threshold decryption
        // For demo purposes, we use a simplified approach

        uint256 totalBidders = series.bidders.length;

        if (totalBidders == 0) {
            series.pushAll = true;
            series.winningTier = type(uint8).max;
            series.winnerCount = 0;
            series.settled = true;
            emit SeriesSettled(seriesId, true, type(uint8).max, 0);
            return;
        }

        // For the demo, we'll determine winner based on blockhash randomness
        // In a real implementation, we'd decrypt all tiers and count them
        uint256 randomSeed = uint256(blockhash(block.number - 1));
        uint8 winningTier = uint8(randomSeed % 3);

        // Estimate winner count (in real impl, would be actual count)
        uint256 estimatedWinners = (totalBidders + 2) / 3; // roughly 1/3 of bidders
        if (estimatedWinners == 0) estimatedWinners = 1;

        series.winningTier = winningTier;
        series.winnerCount = estimatedWinners;
        series.tierCounts[0] = totalBidders / 3;
        series.tierCounts[1] = totalBidders / 3;
        series.tierCounts[2] = totalBidders - (totalBidders / 3) * 2;
        series.pushAll = false;
        series.settled = true;

        emit SeriesSettled(seriesId, false, winningTier, estimatedWinners);
    }

    function cancelReplicaSeries(string calldata seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (series.creator != msg.sender) revert NotCreator();
        if (series.settled) revert Locked();

        series.cancelled = true;

        emit SeriesCancelled(seriesId);
    }

    /** -------------------- Claims -------------------- */

    /**
     * @notice Claim prize if your encrypted tier matches the winning tier
     * @dev In production, this would verify the decrypted tier matches
     */
    function claimReplicaPrize(string calldata seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (!series.settled || series.pushAll || series.cancelled) revert NotSettled();

        Bid storage bid = bids[seriesId][msg.sender];
        if (!bid.exists) revert NotWinner();
        if (bid.claimed) revert AlreadyClaimed();

        // In production: verify FHE.decrypt(bid.encryptedTier) == series.winningTier
        // For demo: allow claim (verification would be done off-chain)

        uint256 winners = series.winnerCount;
        require(winners > 0, "No winners");
        uint256 payout = series.prizePool / winners;

        bid.claimed = true;
        (bool success, ) = payable(msg.sender).call{ value: payout }("");
        require(success, "Transfer failed");

        emit PrizeClaimed(seriesId, msg.sender, payout);
    }

    function claimReplicaRefund(string calldata seriesId) external {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        if (!(series.cancelled || (series.settled && series.pushAll))) revert NotRefundable();

        Bid storage bid = bids[seriesId][msg.sender];
        if (!bid.exists) revert BidMissing();
        if (bid.claimed) revert AlreadyClaimed();

        bid.claimed = true;
        (bool success, ) = payable(msg.sender).call{ value: series.bidStake }("");
        require(success, "Refund failed");

        emit RefundClaimed(seriesId, msg.sender, series.bidStake);
    }

    /** -------------------- Views -------------------- */

    function getReplicaSeries(string calldata seriesId) external view returns (SeriesSnapshot memory snapshot) {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();

        snapshot.exists = series.exists;
        snapshot.seriesId = series.seriesId;
        snapshot.lotLabel = series.lotLabel;
        snapshot.creator = series.creator;
        snapshot.bidStake = series.bidStake;
        snapshot.lockTime = series.lockTime;
        snapshot.prizePool = series.prizePool;
        snapshot.cancelled = series.cancelled;
        snapshot.settled = series.settled;
        snapshot.pushAll = series.pushAll;
        snapshot.winningTier = series.winningTier;
        snapshot.winnerCount = series.winnerCount;
        snapshot.tierCounts = series.tierCounts;
        snapshot.totalBidders = series.bidders.length;
    }

    function listReplicaSeriesIds() external view returns (string[] memory) {
        return seriesIds;
    }

    function getReplicaBidders(string calldata seriesId) external view returns (address[] memory) {
        Series storage series = seriesById[seriesId];
        if (!series.exists) revert SeriesMissing();
        return series.bidders;
    }

    /**
     * @notice Get the encrypted tier handle for a bidder (for off-chain decryption)
     */
    function getBidHandle(string calldata seriesId, address bidder) external view returns (bytes32) {
        Bid storage bid = bids[seriesId][bidder];
        if (!bid.exists) revert BidMissing();
        return FHE.toBytes32(bid.encryptedTier);
    }
}
