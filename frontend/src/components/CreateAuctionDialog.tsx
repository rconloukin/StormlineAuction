import { useState } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCreateSeries } from "@/hooks/useAuctions";
import { MIN_STAKE, MIN_DURATION, MAX_DURATION } from "@/config/contracts";
import { Loader2, Zap } from "lucide-react";

interface CreateAuctionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAuctionDialog({ open, onOpenChange }: CreateAuctionDialogProps) {
  const { isConnected } = useAccount();
  const { createSeries, isPending, isConfirming, isSuccess } = useCreateSeries();

  const [seriesId, setSeriesId] = useState("");
  const [lotLabel, setLotLabel] = useState("");
  const [bidStake, setBidStake] = useState(0.001);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    try {
      await createSeries({
        seriesId: seriesId || `auction-${Date.now()}`,
        lotLabel,
        bidStake,
        durationMinutes,
      });

      // Reset form on success
      if (isSuccess) {
        setSeriesId("");
        setLotLabel("");
        setBidStake(0.001);
        setDurationMinutes(30);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to create auction:", error);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background-elevated border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-orbitron text-xl">
            <Zap className="w-5 h-5 text-primary" />
            Create Auction
          </DialogTitle>
          <DialogDescription>
            Launch a new Stormline auction. Set your stake and duration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seriesId">Auction ID (optional)</Label>
              <Input
                id="seriesId"
                placeholder="my-unique-auction"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="bg-background border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for auto-generated ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotLabel">Auction Title *</Label>
              <Input
                id="lotLabel"
                placeholder="Rare NFT Collection"
                value={lotLabel}
                onChange={(e) => setLotLabel(e.target.value)}
                required
                className="bg-background border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Bid Stake: {bidStake} ETH</Label>
              <Slider
                value={[bidStake * 10000]}
                onValueChange={([v]) => setBidStake(v / 10000)}
                min={MIN_STAKE * 10000}
                max={100} // 0.01 ETH max
                step={1}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Min: {MIN_STAKE} ETH
              </p>
            </div>

            <div className="space-y-2">
              <Label>Duration: {formatDuration(durationMinutes)}</Label>
              <Slider
                value={[durationMinutes]}
                onValueChange={([v]) => setDurationMinutes(v)}
                min={MIN_DURATION / 60}
                max={Math.min(MAX_DURATION / 60, 1440)} // Max 24 hours for UI
                step={10}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Min: {MIN_DURATION / 60} min, Max: {MAX_DURATION / 3600} hours
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isPending || isConfirming || !lotLabel}
              className="bg-gradient-primary text-background font-semibold"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? "Confirm in wallet..." : "Creating..."}
                </>
              ) : (
                "Create Auction"
              )}
            </Button>
          </DialogFooter>
        </form>

        {!isConnected && (
          <p className="text-sm text-center text-destructive">
            Please connect your wallet to create an auction
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
