const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.STORMLINE_AUCTION_ADDRESS || "0xB55a4427923658861C601098035457E33D24fDE9";

  console.log("Seeding auctions to:", contractAddress);

  const StormlineAuction = await hre.ethers.getContractFactory("StormlineAuction");
  const auction = StormlineAuction.attach(contractAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Define test auctions
  const testAuctions = [
    {
      seriesId: "storm-alpha-001",
      lotLabel: "Alpha Storm Series",
      bidStake: hre.ethers.parseEther("0.001"),
      duration: 60 * 60, // 1 hour
    },
    {
      seriesId: "storm-beta-002",
      lotLabel: "Beta Thunder Collection",
      bidStake: hre.ethers.parseEther("0.002"),
      duration: 2 * 60 * 60, // 2 hours
    },
    {
      seriesId: "storm-gamma-003",
      lotLabel: "Gamma Lightning Vault",
      bidStake: hre.ethers.parseEther("0.0015"),
      duration: 30 * 60, // 30 minutes
    },
  ];

  for (const auctionData of testAuctions) {
    try {
      console.log(`\nCreating auction: ${auctionData.lotLabel}`);
      const tx = await auction.createReplicaSeries(
        auctionData.seriesId,
        auctionData.lotLabel,
        auctionData.bidStake,
        auctionData.duration
      );
      await tx.wait();
      console.log(`  Created: ${auctionData.seriesId}`);
    } catch (error) {
      if (error.message.includes("SeriesExists")) {
        console.log(`  Skipped (already exists): ${auctionData.seriesId}`);
      } else {
        console.error(`  Error creating ${auctionData.seriesId}:`, error.message);
      }
    }
  }

  // List all auctions
  console.log("\n--- Current Auctions ---");
  const seriesIds = await auction.listReplicaSeriesIds();
  console.log("Total auctions:", seriesIds.length);

  for (const id of seriesIds) {
    const series = await auction.getReplicaSeries(id);
    console.log(`\n  ${series.lotLabel} (${id})`);
    console.log(`    Stake: ${hre.ethers.formatEther(series.bidStake)} ETH`);
    console.log(`    Prize Pool: ${hre.ethers.formatEther(series.prizePool)} ETH`);
    console.log(`    Lock Time: ${new Date(Number(series.lockTime) * 1000).toISOString()}`);
    console.log(`    Total Bidders: ${series.totalBidders}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
