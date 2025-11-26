import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ExternalLink, Trophy, RefreshCw, Wallet, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useAllAuctions, useMultipleSeriesBidders, useClaimPrize, useClaimRefund } from "@/hooks/useAuctions";
import { TIER_NAMES } from "@/config/contracts";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo } from "react";

export default function MyBids() {
  const { address, isConnected } = useAccount();
  const { auctions, isLoading: auctionsLoading } = useAllAuctions();
  const { claimPrize, isPending: isClaimingPrize } = useClaimPrize();
  const { claimRefund, isPending: isClaimingRefund } = useClaimRefund();

  // Get all series IDs
  const seriesIds = useMemo(() => {
    return auctions?.map(a => a.seriesId) || [];
  }, [auctions]);

  // Get bidders for all series
  const { data: biddersData, isLoading: biddersLoading } = useMultipleSeriesBidders(seriesIds);

  // Filter auctions where user has bid
  const userBids = useMemo(() => {
    if (!auctions || !biddersData || !address) return [];

    return auctions.filter((auction, index) => {
      const result = biddersData[index];
      if (result?.status !== "success" || !result.result) return false;

      const bidders = result.result as `0x${string}`[];
      return bidders.some(
        (bidder) => bidder.toLowerCase() === address.toLowerCase()
      );
    });
  }, [auctions, biddersData, address]);

  const isLoading = auctionsLoading || biddersLoading;

  if (!isConnected) {
    return (
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-2">My Bids</h1>
            <p className="text-muted-foreground mb-8">
              Track your active and settled auction participations
            </p>

            <motion.div
              className="text-center py-20 glass rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-orbitron font-bold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view your bids
              </p>
              <ConnectButton />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-2">My Bids</h1>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-2">My Bids</h1>
          <p className="text-muted-foreground mb-8">
            Track your active and settled auction participations
          </p>

          {userBids.length > 0 ? (
            <div className="space-y-4">
              {userBids.map((auction, index) => {
                const status = auction.status;
                const isWinner = status === "settled" && !auction.pushAll;
                const canRefund = status === "push" || auction.cancelled;
                const prizePerWinner = isWinner && Number(auction.winnerCount) > 0
                  ? Number(auction.prizePool) / Number(auction.winnerCount)
                  : 0;

                return (
                  <motion.div
                    key={auction.seriesId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{auction.lotLabel}</h3>
                          {isWinner && (
                            <Trophy className="w-5 h-5 text-accent animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mb-3">
                          {auction.seriesId}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Prize Pool: </span>
                            <span className="font-mono font-semibold text-primary">
                              {parseFloat(formatEther(auction.prizePool)).toFixed(4)} ETH
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bidders: </span>
                            <span className="font-mono font-semibold">{auction.totalBidders}</span>
                          </div>
                          {isWinner && (
                            <div>
                              <span className="text-muted-foreground">Winning Tier: </span>
                              <Badge
                                variant="outline"
                                className={
                                  auction.winningTier === 0
                                    ? "border-tier-ember text-tier-ember"
                                    : auction.winningTier === 1
                                    ? "border-tier-gale text-tier-gale"
                                    : "border-tier-flash text-tier-flash"
                                }
                              >
                                {TIER_NAMES[auction.winningTier]}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={status === "open" ? "default" : "secondary"}
                          className={
                            status === "open"
                              ? "bg-status-open/20 text-status-open border-status-open/50"
                              : status === "settled" && isWinner
                              ? "bg-accent/20 text-accent border-accent/50"
                              : ""
                          }
                        >
                          {status.toUpperCase()}
                        </Badge>

                        {status === "open" ? (
                          <Link to={`/auction/${auction.seriesId}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <RefreshCw className="w-4 h-4" />
                              View
                            </Button>
                          </Link>
                        ) : status === "locked" ? (
                          <Link to={`/auction/${auction.seriesId}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              Settle
                            </Button>
                          </Link>
                        ) : isWinner ? (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                            onClick={() => claimPrize(auction.seriesId)}
                            disabled={isClaimingPrize}
                          >
                            {isClaimingPrize ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trophy className="w-4 h-4" />
                            )}
                            Claim Prize
                          </Button>
                        ) : canRefund ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => claimRefund(auction.seriesId)}
                            disabled={isClaimingRefund}
                          >
                            {isClaimingRefund ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Claim Refund"
                            )}
                          </Button>
                        ) : (
                          <Link to={`/auction/${auction.seriesId}`}>
                            <Button size="sm" variant="ghost" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="text-center py-20 glass rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-orbitron font-bold mb-2">No Bids Yet</h3>
              <p className="text-muted-foreground mb-6">
                Join an auction to start tracking your bids
              </p>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Auctions</Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
