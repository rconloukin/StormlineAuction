import { Link } from "react-router-dom";
import { Clock, Users, Coins, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AuctionCardProps {
  id: string;
  lotLabel: string;
  prizePool: number;
  bidStake: number;
  totalBidders: number;
  lockTime: Date;
  status: "open" | "locked" | "settled" | "cancelled" | "push";
  emberCount: number;
  galeCount: number;
  flashCount: number;
}

export function AuctionCard({
  id,
  lotLabel,
  prizePool,
  bidStake,
  totalBidders,
  lockTime,
  status,
  emberCount,
  galeCount,
  flashCount,
}: AuctionCardProps) {
  const now = new Date();
  const timeLeft = Math.max(0, Math.floor((lockTime.getTime() - now.getTime()) / 1000));
  const totalBids = emberCount + galeCount + flashCount;

  const statusConfig = {
    open: { label: "OPEN", variant: "default" as const, color: "status-open" },
    locked: { label: "LOCKED", variant: "secondary" as const, color: "status-locked" },
    settled: { label: "SETTLED", variant: "outline" as const, color: "status-result" },
    cancelled: { label: "CANCELLED", variant: "destructive" as const, color: "status-cancelled" },
    push: { label: "PUSH", variant: "secondary" as const, color: "status-push" },
  };

  const { label, variant } = statusConfig[status];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <Link to={`/auction/${id}`}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background-elevated p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Status Badge */}
        <Badge
          variant={variant}
          className={cn(
            "absolute top-4 right-4 z-10 font-semibold",
            status === "open" && "bg-status-open/20 text-status-open border-status-open/50 animate-pulse-glow"
          )}
        >
          {label}
        </Badge>

        {/* Title */}
        <h3 className="text-2xl font-orbitron font-bold mb-4 pr-24 group-hover:text-primary transition-colors">
          {lotLabel}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Coins className="w-4 h-4" />
              <span>Prize Pool</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-primary">{prizePool.toFixed(4)}</span>
              <span className="text-xs text-muted-foreground">ETH</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="w-4 h-4" />
              <span>Bidders</span>
            </div>
            <span className="text-2xl font-mono font-bold text-accent">{totalBidders}</span>
          </div>
        </div>

        {/* Countdown */}
        {status === "open" && (
          <div className={cn(
            "flex items-center gap-2 mb-6 font-mono text-lg",
            timeLeft < 120 && "text-tier-ember animate-pulse"
          )}>
            <Clock className="w-5 h-5" />
            <span>{timeLeft > 0 ? formatTime(timeLeft) : "LOCKING..."}</span>
          </div>
        )}

        {/* Tier Heat Bars */}
        <div className="space-y-2">
          <TierBar tier="Ember" count={emberCount} total={totalBids} color="tier-ember" />
          <TierBar tier="Gale" count={galeCount} total={totalBids} color="tier-gale" />
          <TierBar tier="Flash" count={flashCount} total={totalBids} color="tier-flash" />
        </div>

        {/* Hover Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </Link>
  );
}

function TierBar({ tier, count, total, color }: { tier: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="relative h-8 rounded-full overflow-hidden bg-white/5">
      <motion.div
        className={cn("absolute inset-y-0 left-0 rounded-full", `bg-${color}`, `glow-${color}`)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      <div className="relative z-10 flex items-center justify-between px-3 h-full text-sm">
        <span className="font-medium">{tier}</span>
        <span className="font-mono">{count}</span>
      </div>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ left: ["-100px", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
