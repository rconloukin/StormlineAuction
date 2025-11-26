import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { AuctionCard } from "@/components/AuctionCard";
import { useAllAuctions } from "@/hooks/useAuctions";
import { STORMLINE_AUCTION_ADDRESS } from "@/config/contracts";

export default function AuctionHall() {
  const { auctions, isLoading, error } = useAllAuctions();

  // Calculate stats from real data
  const stats = auctions ? {
    activeAuctions: auctions.filter(a => a.status === "open" || a.status === "locked").length,
    totalBidders: auctions.reduce((sum, a) => sum + a.totalBidders, 0),
    totalVolume: auctions.reduce((sum, a) => sum + Number(a.prizePool) / 1e18, 0),
    avgStake: auctions.length > 0
      ? auctions.reduce((sum, a) => sum + Number(a.bidStake) / 1e18, 0) / auctions.length
      : 0,
  } : null;

  if (!STORMLINE_AUCTION_ADDRESS) {
    return (
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              STORMLINE AUCTION
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Private encrypted bidding powered by FHE technology.
            </p>
          </motion.div>

          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-orbitron font-bold mb-2 text-accent">Contract Not Deployed</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The StormlineAuction contract has not been deployed yet.
              Please deploy the contract and update the address in the configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            STORMLINE AUCTION
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Private encrypted bidding powered by FHE technology.
            <br />
            <span className="text-primary">Choose your tier. Place your weight. Win the storm.</span>
          </p>
        </motion.div>

        {/* Stats Bar */}
        {stats && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 rounded-2xl glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatCard label="Active Auctions" value={stats.activeAuctions.toString()} />
            <StatCard label="Total Bidders" value={stats.totalBidders.toString()} />
            <StatCard label="Total Volume" value={`${stats.totalVolume.toFixed(2)} ETH`} />
            <StatCard label="Avg. Stake" value={`${stats.avgStake.toFixed(4)} ETH`} />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-orbitron font-bold mb-2 text-destructive">Error Loading Auctions</h3>
            <p className="text-muted-foreground">
              {error.message || "Failed to load auctions. Please try again."}
            </p>
          </motion.div>
        )}

        {/* Auction Grid */}
        {!isLoading && !error && auctions && auctions.length > 0 && (
          <motion.div
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {auctions.map((auction, index) => (
              <motion.div
                key={auction.seriesId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <AuctionCard
                  id={auction.seriesId}
                  lotLabel={auction.lotLabel}
                  prizePool={Number(auction.prizePool) / 1e18}
                  bidStake={Number(auction.bidStake) / 1e18}
                  totalBidders={auction.totalBidders}
                  lockTime={new Date(Number(auction.lockTime) * 1000)}
                  status={auction.status}
                  emberCount={Number(auction.tierBidders[0])}
                  galeCount={Number(auction.tierBidders[1])}
                  flashCount={Number(auction.tierBidders[2])}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!auctions || auctions.length === 0) && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center glow-primary">
              <Zap className="w-12 h-12 text-background" />
            </div>
            <h3 className="text-2xl font-orbitron font-bold mb-2">No Active Auctions</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to create a Stormline auction! Click "Create Auction" to get started.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-mono font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
