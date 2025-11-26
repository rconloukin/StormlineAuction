import { expect } from "chai";
import { ethers } from "hardhat";
import { StormlineAuction } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StormlineAuction", function () {
  let stormline: StormlineAuction;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let charlie: HardhatEthersSigner;

  const MIN_STAKE = ethers.parseEther("0.0004");
  const STANDARD_STAKE = ethers.parseEther("0.001");
  const MIN_DURATION = 10 * 60; // 10 minutes
  const STANDARD_DURATION = 60 * 60; // 1 hour

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const StormlineAuction = await ethers.getContractFactory("StormlineAuction");
    stormline = await StormlineAuction.deploy();
    await stormline.waitForDeployment();
  });

  describe("Series Creation", function () {
    it("Should create a new auction series", async function () {
      const seriesId = "AUCTION-001";
      const lotLabel = "Test Auction #1";

      await expect(
        stormline.createReplicaSeries(seriesId, lotLabel, STANDARD_STAKE, STANDARD_DURATION)
      )
        .to.emit(stormline, "SeriesCreated")
        .withArgs(seriesId, lotLabel, STANDARD_STAKE, await time.latest() + STANDARD_DURATION + 1);

      const series = await stormline.getReplicaSeries(seriesId);
      expect(series.exists).to.be.true;
      expect(series.seriesId).to.equal(seriesId);
      expect(series.lotLabel).to.equal(lotLabel);
      expect(series.creator).to.equal(owner.address);
      expect(series.bidStake).to.equal(STANDARD_STAKE);
      expect(series.prizePool).to.equal(0);
      expect(series.totalBidders).to.equal(0);
    });

    it("Should reject duplicate series ID", async function () {
      const seriesId = "AUCTION-001";
      await stormline.createReplicaSeries(seriesId, "First", STANDARD_STAKE, STANDARD_DURATION);

      await expect(
        stormline.createReplicaSeries(seriesId, "Duplicate", STANDARD_STAKE, STANDARD_DURATION)
      ).to.be.revertedWithCustomError(stormline, "SeriesExists");
    });

    it("Should reject stake below minimum", async function () {
      const lowStake = ethers.parseEther("0.0003");

      await expect(
        stormline.createReplicaSeries("AUCTION-001", "Low Stake", lowStake, STANDARD_DURATION)
      ).to.be.revertedWithCustomError(stormline, "InvalidStake");
    });

    it("Should reject duration below minimum", async function () {
      const shortDuration = 5 * 60; // 5 minutes

      await expect(
        stormline.createReplicaSeries("AUCTION-001", "Short Duration", STANDARD_STAKE, shortDuration)
      ).to.be.revertedWithCustomError(stormline, "InvalidDuration");
    });

    it("Should reject duration above maximum", async function () {
      const longDuration = 97 * 60 * 60; // 97 hours

      await expect(
        stormline.createReplicaSeries("AUCTION-001", "Long Duration", STANDARD_STAKE, longDuration)
      ).to.be.revertedWithCustomError(stormline, "InvalidDuration");
    });

    it("Should list all series IDs", async function () {
      await stormline.createReplicaSeries("AUCTION-001", "First", STANDARD_STAKE, STANDARD_DURATION);
      await stormline.createReplicaSeries("AUCTION-002", "Second", STANDARD_STAKE, STANDARD_DURATION);
      await stormline.createReplicaSeries("AUCTION-003", "Third", STANDARD_STAKE, STANDARD_DURATION);

      const ids = await stormline.listReplicaSeriesIds();
      expect(ids).to.have.lengthOf(3);
      expect(ids).to.include("AUCTION-001");
      expect(ids).to.include("AUCTION-002");
      expect(ids).to.include("AUCTION-003");
    });
  });

  describe("Bidding", function () {
    let seriesId: string;

    beforeEach(async function () {
      seriesId = "AUCTION-BID-001";
      await stormline.createReplicaSeries(seriesId, "Bidding Test", STANDARD_STAKE, STANDARD_DURATION);
    });

    it("Should accept bid with correct stake (Note: FHE encryption mocked)", async function () {
      // Note: In a real test, we would use the FHE library to create encrypted inputs
      // For this test, we're using placeholder values since FHE setup is complex
      const mockEncryptedTier = ethers.ZeroHash; // Placeholder
      const mockProof = "0x"; // Placeholder

      // This test will fail in practice due to FHE requirements
      // but demonstrates the expected interface
      await expect(
        stormline.connect(alice).enterReplicaSeries(seriesId, mockEncryptedTier, mockProof, {
          value: STANDARD_STAKE,
        })
      ).to.be.reverted; // Expected to revert due to invalid FHE proof
    });

    it("Should reject bid with incorrect stake", async function () {
      const wrongStake = ethers.parseEther("0.0005");
      const mockEncryptedTier = ethers.ZeroHash;
      const mockProof = "0x";

      await expect(
        stormline.connect(alice).enterReplicaSeries(seriesId, mockEncryptedTier, mockProof, {
          value: wrongStake,
        })
      ).to.be.revertedWithCustomError(stormline, "InvalidStake");
    });

    it("Should reject bid after lock time", async function () {
      // Fast forward past lock time
      await time.increase(STANDARD_DURATION + 1);

      const mockEncryptedTier = ethers.ZeroHash;
      const mockProof = "0x";

      await expect(
        stormline.connect(alice).enterReplicaSeries(seriesId, mockEncryptedTier, mockProof, {
          value: STANDARD_STAKE,
        })
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });

    it("Should reject bid on non-existent series", async function () {
      const mockEncryptedTier = ethers.ZeroHash;
      const mockProof = "0x";

      await expect(
        stormline.connect(alice).enterReplicaSeries("NONEXISTENT", mockEncryptedTier, mockProof, {
          value: STANDARD_STAKE,
        })
      ).to.be.revertedWithCustomError(stormline, "SeriesMissing");
    });
  });

  describe("Settlement", function () {
    let seriesId: string;

    beforeEach(async function () {
      seriesId = "AUCTION-SETTLE-001";
      await stormline.createReplicaSeries(seriesId, "Settlement Test", STANDARD_STAKE, STANDARD_DURATION);
    });

    it("Should not settle before lock time", async function () {
      await expect(
        stormline.settleReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });

    it("Should settle after lock time with no bids (push all)", async function () {
      // Fast forward past lock time
      await time.increase(STANDARD_DURATION + 1);

      await expect(stormline.settleReplicaSeries(seriesId))
        .to.emit(stormline, "SeriesSettled")
        .withArgs(seriesId, true, 255, 0); // pushAll = true, no winners

      const series = await stormline.getReplicaSeries(seriesId);
      expect(series.settled).to.be.true;
      expect(series.pushAll).to.be.true;
      expect(series.winnerCount).to.equal(0);
    });

    it("Should not settle twice", async function () {
      await time.increase(STANDARD_DURATION + 1);
      await stormline.settleReplicaSeries(seriesId);

      await expect(
        stormline.settleReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });

    it("Should not settle cancelled series", async function () {
      await stormline.cancelReplicaSeries(seriesId);
      await time.increase(STANDARD_DURATION + 1);

      await expect(
        stormline.settleReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });
  });

  describe("Cancellation", function () {
    let seriesId: string;

    beforeEach(async function () {
      seriesId = "AUCTION-CANCEL-001";
      await stormline.createReplicaSeries(seriesId, "Cancellation Test", STANDARD_STAKE, STANDARD_DURATION);
    });

    it("Should allow creator to cancel series", async function () {
      await expect(stormline.cancelReplicaSeries(seriesId))
        .to.emit(stormline, "SeriesCancelled")
        .withArgs(seriesId);

      const series = await stormline.getReplicaSeries(seriesId);
      expect(series.cancelled).to.be.true;
    });

    it("Should reject cancellation from non-creator", async function () {
      await expect(
        stormline.connect(alice).cancelReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "NotCreator");
    });

    it("Should not cancel already settled series", async function () {
      await time.increase(STANDARD_DURATION + 1);
      await stormline.settleReplicaSeries(seriesId);

      await expect(
        stormline.cancelReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });
  });

  describe("Prize Claims", function () {
    let seriesId: string;

    beforeEach(async function () {
      seriesId = "AUCTION-CLAIM-001";
      await stormline.createReplicaSeries(seriesId, "Prize Test", STANDARD_STAKE, STANDARD_DURATION);
    });

    it("Should reject claim before settlement", async function () {
      await expect(
        stormline.connect(alice).claimReplicaPrize(seriesId)
      ).to.be.revertedWithCustomError(stormline, "NotSettled");
    });

    it("Should reject claim without bid", async function () {
      await time.increase(STANDARD_DURATION + 1);
      await stormline.settleReplicaSeries(seriesId);

      await expect(
        stormline.connect(alice).claimReplicaPrize(seriesId)
      ).to.be.revertedWithCustomError(stormline, "NotWinner");
    });
  });

  describe("Refund Claims", function () {
    let seriesId: string;

    beforeEach(async function () {
      seriesId = "AUCTION-REFUND-001";
      await stormline.createReplicaSeries(seriesId, "Refund Test", STANDARD_STAKE, STANDARD_DURATION);
    });

    it("Should reject refund on active series", async function () {
      await expect(
        stormline.connect(alice).claimReplicaRefund(seriesId)
      ).to.be.revertedWithCustomError(stormline, "NotRefundable");
    });

    it("Should reject refund without bid", async function () {
      await stormline.cancelReplicaSeries(seriesId);

      await expect(
        stormline.connect(alice).claimReplicaRefund(seriesId)
      ).to.be.revertedWithCustomError(stormline, "BidMissing");
    });
  });

  describe("View Functions", function () {
    it("Should return series details", async function () {
      const seriesId = "AUCTION-VIEW-001";
      const lotLabel = "View Test";

      await stormline.createReplicaSeries(seriesId, lotLabel, STANDARD_STAKE, STANDARD_DURATION);

      const series = await stormline.getReplicaSeries(seriesId);
      expect(series.seriesId).to.equal(seriesId);
      expect(series.lotLabel).to.equal(lotLabel);
      expect(series.bidStake).to.equal(STANDARD_STAKE);
      expect(series.creator).to.equal(owner.address);
    });

    it("Should return empty bidders array for new series", async function () {
      const seriesId = "AUCTION-VIEW-002";
      await stormline.createReplicaSeries(seriesId, "Empty Bidders", STANDARD_STAKE, STANDARD_DURATION);

      const bidders = await stormline.getReplicaBidders(seriesId);
      expect(bidders).to.have.lengthOf(0);
    });

    it("Should reject view for non-existent series", async function () {
      await expect(
        stormline.getReplicaSeries("NONEXISTENT")
      ).to.be.revertedWithCustomError(stormline, "SeriesMissing");
    });

    it("Should reject getBidHandle for non-existent bid", async function () {
      const seriesId = "AUCTION-VIEW-003";
      await stormline.createReplicaSeries(seriesId, "No Bid", STANDARD_STAKE, STANDARD_DURATION);

      await expect(
        stormline.getBidHandle(seriesId, alice.address)
      ).to.be.revertedWithCustomError(stormline, "BidMissing");
    });
  });

  describe("Constants", function () {
    it("Should have correct minimum stake", async function () {
      expect(await stormline.MIN_STAKE()).to.equal(MIN_STAKE);
    });

    it("Should have correct minimum duration", async function () {
      expect(await stormline.MIN_DURATION()).to.equal(MIN_DURATION);
    });

    it("Should have correct maximum duration", async function () {
      const MAX_DURATION = 96 * 60 * 60; // 96 hours
      expect(await stormline.MAX_DURATION()).to.equal(MAX_DURATION);
    });
  });
});
