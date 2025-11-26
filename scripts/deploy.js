const hre = require("hardhat");

async function main() {
  console.log("Deploying StormlineAuction contract...");

  const StormlineAuction = await hre.ethers.getContractFactory("StormlineAuction");
  const auction = await StormlineAuction.deploy();

  await auction.waitForDeployment();

  const address = await auction.getAddress();
  console.log("✅ StormlineAuction deployed to:", address);

  // Read contract constants
  const minStake = await auction.MIN_STAKE();
  const minDuration = await auction.MIN_DURATION();
  const maxDuration = await auction.MAX_DURATION();

  console.log("\n📋 Contract Configuration:");
  console.log("  MIN_STAKE:", hre.ethers.formatEther(minStake), "ETH");
  console.log("  MIN_DURATION:", minDuration.toString(), "seconds (", (Number(minDuration) / 60), "minutes)");
  console.log("  MAX_DURATION:", maxDuration.toString(), "seconds (", (Number(maxDuration) / 3600), "hours)");

  console.log("\n🔧 Update frontend/src/constants/contracts.ts with:");
  console.log(`export const STORMLINE_AUCTION_ADDRESS: Address = "${address}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
