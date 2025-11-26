import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Coins, Lock, Flame, Wind, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeries, useEnterSeries, useSettleSeries, useClaimPrize, useClaimRefund } from "@/hooks/useAuctions";
import { Tier, TIER_NAMES, getAuctionStatus } from "@/config/contracts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function AuctionDetail() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const { address, isConnected } = useAccount();
  const { data: series, isLoading, error } = useSeries(seriesId);

  const { enterSeries, isPending: isEntering, isEncrypting } = useEnterSeries();
  const { settleSeries, isPending: isSettling } = useSettleSeries();
  const { claimPrize, isPending: isClaiming } = useClaimPrize();
  const { claimRefund, isPending: isRefunding } = useClaimRefund();

  const [selectedTier, setSelectedTier] = useState<Tier>(Tier.Gale);
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!series) return;

    const lockTime = Number(series.lockTime) * 1000;
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockTime - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [series]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Auction Hall
        </Link>
        <div className="text-center py-20">
          <h2 className="text-2xl font-orbitron font-bold text-destructive">Auction Not Found</h2>
          <p className="text-muted-foreground mt-2">The auction you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const status = getAuctionStatus(series);
  const totalBidders = Number(series.totalBidders);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const tierIcons = {
    [Tier.Ember]: <Flame className="w-6 h-6" />,
    [Tier.Gale]: <Wind className="w-6 h-6" />,
    [Tier.Flash]: <Zap className="w-6 h-6" />,
  };

  const tierColors = {
    [Tier.Ember]: "border-tier-ember bg-tier-ember/10 text-tier-ember",
    [Tier.Gale]: "border-tier-gale bg-tier-gale/10 text-tier-gale",
    [Tier.Flash]: "border-tier-flash bg-tier-flash/10 text-tier-flash",
  };

  const handleBid = async () => {
    if (!address || !seriesId) return;

    await enterSeries({
      seriesId,
      tier: selectedTier,
      bidStake: series.bidStake,
      userAddress: address,
    });
  };

  const handleSettle = async () => {
    if (!seriesId) return;
    await settleSeries(seriesId);
  };

  const handleClaimPrize = async () => {
    if (!seriesId) return;
    await claimPrize(seriesId);
  };

  const handleClaimRefund = async () => {
    if (!seriesId) return;
    await claimRefund(seriesId);
  };

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Auction Hall
        </Link>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-orbitron font-bold mb-2">{series.lotLabel}</h1>
              <p className="text-muted-foreground font-mono">{series.seriesId}</p>
            </div>
            <Badge
              variant={status === "open" ? "default" : "secondary"}
              className={cn(
                "text-lg px-4 py-2",
                status === "open" && "bg-status-open/20 text-status-open border-status-open/50 animate-pulse-glow"
              )}
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-background-elevated border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Coins className="w-4 h-4" />
                    Prize Pool
                  </div>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {parseFloat(formatEther(series.prizePool)).toFixed(4)} ETH
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background-elevated border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    Bidders
                  </div>
                  <div className="text-2xl font-mono font-bold text-accent">
                    {totalBidders}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background-elevated border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Lock className="w-4 h-4" />
                    Stake
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {parseFloat(formatEther(series.bidStake)).toFixed(4)} ETH
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background-elevated border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    {status === "open" ? "Time Left" : "Status"}
                  </div>
                  <div className={cn(
                    "text-2xl font-mono font-bold",
                    timeLeft < 120 && status === "open" && "text-tier-ember animate-pulse"
                  )}>
                    {status === "open" ? formatTime(timeLeft) : status.toUpperCase()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tier Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-background-elevated border-white/10">
                <CardHeader>
                  <CardTitle className="font-orbitron">Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[Tier.Ember, Tier.Gale, Tier.Flash].map((tier) => {
                    const count = Number(series.tierCounts[tier]);
                    const percentage = totalBidders > 0 ? (count / totalBidders) * 100 : 0;
                    const isWinning = series.settled && series.winningTier === tier;

                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {tierIcons[tier]}
                            <span className="font-medium">{TIER_NAMES[tier]}</span>
                            {isWinning && (
                              <Badge variant="default" className="bg-status-open text-background">
                                WINNER
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono">{count} bidders</span>
                        </div>
                        <div className="relative h-6 rounded-full overflow-hidden bg-white/5">
                          <motion.div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              tier === Tier.Ember && "bg-tier-ember",
                              tier === Tier.Gale && "bg-tier-gale",
                              tier === Tier.Flash && "bg-tier-flash"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Bid Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-background-elevated border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="font-orbitron">
                  {status === "open" ? "Place Your Bid" :
                   status === "locked" ? "Waiting for Settlement" :
                   status === "settled" ? "Claim Rewards" :
                   "Auction Ended"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {status === "open" && (
                  <>
                    {/* Tier Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Select Tier</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[Tier.Ember, Tier.Gale, Tier.Flash].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setSelectedTier(tier)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                              selectedTier === tier
                                ? tierColors[tier]
                                : "border-white/10 hover:border-white/30"
                            )}
                          >
                            {tierIcons[tier]}
                            <span className="text-sm font-medium">{TIER_NAMES[tier]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stake Info */}
                    <div className="p-4 rounded-xl bg-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Required Stake</span>
                        <span className="font-mono">{parseFloat(formatEther(series.bidStake)).toFixed(4)} ETH</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleBid}
                      disabled={!isConnected || isEntering || isEncrypting}
                      className="w-full h-12 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isEntering || isEncrypting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEncrypting ? "Encrypting..." : "Submitting..."}
                        </>
                      ) : (
                        <>
                          {tierIcons[selectedTier]}
                          <span className="ml-2">Place {TIER_NAMES[selectedTier]} Bid</span>
                        </>
                      )}
                    </Button>

                    {!isConnected && (
                      <p className="text-sm text-center text-muted-foreground">
                        Connect wallet to place a bid
                      </p>
                    )}
                  </>
                )}

                {status === "locked" && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center">
                      Auction is locked. Anyone can settle to reveal the winning tier.
                    </p>
                    <Button
                      onClick={handleSettle}
                      disabled={isSettling}
                      className="w-full"
                    >
                      {isSettling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Settling...
                        </>
                      ) : (
                        "Settle Auction"
                      )}
                    </Button>
                  </div>
                )}

                {status === "settled" && !series.pushAll && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-status-open/10 border border-status-open/30">
                      <p className="text-center font-medium text-status-open">
                        Winning Tier: {TIER_NAMES[series.winningTier]}
                      </p>
                      <p className="text-center text-sm text-muted-foreground mt-1">
                        {Number(series.winnerCount)} winners sharing the prize
                      </p>
                    </div>
                    <Button
                      onClick={handleClaimPrize}
                      disabled={isClaiming}
                      className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        "Claim Prize"
                      )}
                    </Button>
                  </div>
                )}

                {(status === "push" || series.cancelled) && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                      <p className="text-center font-medium text-accent">
                        {series.cancelled ? "Auction Cancelled" : "Push - No Winner"}
                      </p>
                      <p className="text-center text-sm text-muted-foreground mt-1">
                        All bidders can claim refunds
                      </p>
                    </div>
                    <Button
                      onClick={handleClaimRefund}
                      disabled={isRefunding}
                      className="w-full"
                    >
                      {isRefunding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        "Claim Refund"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
