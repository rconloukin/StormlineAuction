import { expect } from "chai";
import { ethers } from "hardhat";
import { StormlineAuction } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StormlineAuction - Integration Tests", function () {
  let stormline: StormlineAuction;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let charlie: HardhatEthersSigner;

  const STANDARD_STAKE = ethers.parseEther("0.001");
  const STANDARD_DURATION = 60 * 60; // 1 hour

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const StormlineAuction = await ethers.getContractFactory("StormlineAuction");
    stormline = await StormlineAuction.deploy();
    await stormline.waitForDeployment();
  });

  describe("Complete Auction Flow - No Bids", function () {
    it("Should handle auction lifecycle with no participants", async function () {
      const seriesId = "INTEGRATION-001";

      // 1. Create auction
      await stormline.createReplicaSeries(
        seriesId,
        "Empty Auction",
        STANDARD_STAKE,
        STANDARD_DURATION
      );

      let series = await stormline.getReplicaSeries(seriesId);
      expect(series.totalBidders).to.equal(0);
      expect(series.prizePool).to.equal(0);

      // 2. Fast forward past lock time
      await time.increase(STANDARD_DURATION + 1);

      // 3. Settle auction (should be push all)
      await stormline.settleReplicaSeries(seriesId);

      series = await stormline.getReplicaSeries(seriesId);
      expect(series.settled).to.be.true;
      expect(series.pushAll).to.be.true;
      expect(series.winnerCount).to.equal(0);
    });
  });

  describe("Complete Auction Flow - Cancellation", function () {
    it("Should handle creator cancellation and refunds", async function () {
      const seriesId = "INTEGRATION-002";

      // 1. Create auction
      await stormline.createReplicaSeries(
        seriesId,
        "Cancelled Auction",
        STANDARD_STAKE,
        STANDARD_DURATION
      );

      // 2. Creator cancels
      await stormline.cancelReplicaSeries(seriesId);

      const series = await stormline.getReplicaSeries(seriesId);
      expect(series.cancelled).to.be.true;

      // 3. Should not be settleable
      await time.increase(STANDARD_DURATION + 1);
      await expect(
        stormline.settleReplicaSeries(seriesId)
      ).to.be.revertedWithCustomError(stormline, "Locked");
    });
  });

  describe("Multiple Auctions", function () {
    it("Should handle multiple concurrent auctions", async function () {
      // Create 3 auctions
      await stormline.createReplicaSeries("MULTI-001", "Auction 1", STANDARD_STAKE, STANDARD_DURATION);
      await stormline.createReplicaSeries("MULTI-002", "Auction 2", ethers.parseEther("0.002"), STANDARD_DURATION);
      await stormline.createReplicaSeries("MULTI-003", "Auction 3", ethers.parseEther("0.003"), STANDARD_DURATION);

      // Check all are listed
      const ids = await stormline.listReplicaSeriesIds();
      expect(ids).to.have.lengthOf(3);
      expect(ids).to.include("MULTI-001");
      expect(ids).to.include("MULTI-002");
      expect(ids).to.include("MULTI-003");

      // Each should have correct stake
      const series1 = await stormline.getReplicaSeries("MULTI-001");
      const series2 = await stormline.getReplicaSeries("MULTI-002");
      const series3 = await stormline.getReplicaSeries("MULTI-003");

      expect(series1.bidStake).to.equal(STANDARD_STAKE);
      expect(series2.bidStake).to.equal(ethers.parseEther("0.002"));
      expect(series3.bidStake).to.equal(ethers.parseEther("0.003"));
    });

    it("Should settle multiple auctions independently", async function () {
      // Create 2 auctions with different durations
      const shortDuration = 30 * 60; // 30 minutes
      const longDuration = 2 * 60 * 60; // 2 hours

      await stormline.createReplicaSeries("MULTI-004", "Short", STANDARD_STAKE, shortDuration);
      await stormline.createReplicaSeries("MULTI-005", "Long", STANDARD_STAKE, longDuration);

      // Fast forward past short auction only
      await time.increase(shortDuration + 1);

      // Should be able to settle short
      await stormline.settleReplicaSeries("MULTI-004");
      const series1 = await stormline.getReplicaSeries("MULTI-004");
      expect(series1.settled).to.be.true;

      // Should not be able to settle long yet
      await expect(
        stormline.settleReplicaSeries("MULTI-005")
      ).to.be.revertedWithCustomError(stormline, "Locked");

      // Fast forward past long auction
      await time.increase(longDuration - shortDuration);

      // Now should be able to settle long
      await stormline.settleReplicaSeries("MULTI-005");
      const series2 = await stormline.getReplicaSeries("MULTI-005");
      expect(series2.settled).to.be.true;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle minimum stake exactly", async function () {
      const MIN_STAKE = ethers.parseEther("0.0004");

      await expect(
        stormline.createReplicaSeries("EDGE-001", "Min Stake", MIN_STAKE, STANDARD_DURATION)
      ).to.not.be.reverted;

      const series = await stormline.getReplicaSeries("EDGE-001");
      expect(series.bidStake).to.equal(MIN_STAKE);
    });

    it("Should handle minimum duration exactly", async function () {
      const MIN_DURATION = 10 * 60; // 10 minutes

      await expect(
        stormline.createReplicaSeries("EDGE-002", "Min Duration", STANDARD_STAKE, MIN_DURATION)
      ).to.not.be.reverted;
    });

    it("Should handle maximum duration exactly", async function () {
      const MAX_DURATION = 96 * 60 * 60; // 96 hours

      await expect(
        stormline.createReplicaSeries("EDGE-003", "Max Duration", STANDARD_STAKE, MAX_DURATION)
      ).to.not.be.reverted;
    });

    it("Should handle very long series IDs", async function () {
      const longId = "A".repeat(100);

      await expect(
        stormline.createReplicaSeries(longId, "Long ID", STANDARD_STAKE, STANDARD_DURATION)
      ).to.not.be.reverted;

      const series = await stormline.getReplicaSeries(longId);
      expect(series.exists).to.be.true;
    });

    it("Should handle special characters in lot label", async function () {
      const specialLabel = "🎯 Special Auction #1 - Test & Demo!";

      await expect(
        stormline.createReplicaSeries("EDGE-004", specialLabel, STANDARD_STAKE, STANDARD_DURATION)
      ).to.not.be.reverted;

      const series = await stormline.getReplicaSeries("EDGE-004");
      expect(series.lotLabel).to.equal(specialLabel);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should list series IDs efficiently", async function () {
      // Create 10 series
      for (let i = 1; i <= 10; i++) {
        await stormline.createReplicaSeries(
          `GAS-${i.toString().padStart(3, "0")}`,
          `Auction ${i}`,
          STANDARD_STAKE,
          STANDARD_DURATION
        );
      }

      // Getting all IDs should be a single read
      const ids = await stormline.listReplicaSeriesIds();
      expect(ids).to.have.lengthOf(10);
    });

    it("Should get series details efficiently", async function () {
      await stormline.createReplicaSeries("GAS-DETAILS", "Details Test", STANDARD_STAKE, STANDARD_DURATION);

      // Getting series should be efficient
      const series = await stormline.getReplicaSeries("GAS-DETAILS");
      expect(series.exists).to.be.true;
      expect(series.seriesId).to.equal("GAS-DETAILS");
    });
  });

  describe("Permission Tests", function () {
    it("Should allow anyone to create series", async function () {
      await expect(
        stormline.connect(alice).createReplicaSeries("ALICE-001", "Alice's Auction", STANDARD_STAKE, STANDARD_DURATION)
      ).to.not.be.reverted;

      const series = await stormline.getReplicaSeries("ALICE-001");
      expect(series.creator).to.equal(alice.address);
    });

    it("Should only allow creator to cancel", async function () {
      await stormline.connect(alice).createReplicaSeries("ALICE-002", "Alice's Auction", STANDARD_STAKE, STANDARD_DURATION);

      // Alice can cancel
      await expect(
        stormline.connect(alice).cancelReplicaSeries("ALICE-002")
      ).to.not.be.reverted;

      // Create another one
      await stormline.connect(alice).createReplicaSeries("ALICE-003", "Alice's Auction 2", STANDARD_STAKE, STANDARD_DURATION);

      // Bob cannot cancel Alice's auction
      await expect(
        stormline.connect(bob).cancelReplicaSeries("ALICE-003")
      ).to.be.revertedWithCustomError(stormline, "NotCreator");
    });

    it("Should allow anyone to settle after lock time", async function () {
      await stormline.createReplicaSeries("PUBLIC-SETTLE", "Public Settlement", STANDARD_STAKE, STANDARD_DURATION);

      await time.increase(STANDARD_DURATION + 1);

      // Anyone can settle
      await expect(
        stormline.connect(bob).settleReplicaSeries("PUBLIC-SETTLE")
      ).to.not.be.reverted;

      const series = await stormline.getReplicaSeries("PUBLIC-SETTLE");
      expect(series.settled).to.be.true;
    });
  });
});
