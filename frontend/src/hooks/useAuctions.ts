import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import {
  STORMLINE_AUCTION_ADDRESS,
  STORMLINE_AUCTION_ABI,
  SeriesSnapshot,
  getAuctionStatus,
  Tier,
  TIER_NAMES
} from "@/config/contracts";
import { encryptTier } from "@/lib/fhe";
import { showTxSubmitted, showTxSuccess, showTxError, showSubmitError, showInfo } from "@/lib/txToast";
import { useState, useCallback, useEffect } from "react";
import type { Address } from "viem";

// Hook to list all series IDs
export function useSeriesIds() {
  return useReadContract({
    address: STORMLINE_AUCTION_ADDRESS,
    abi: STORMLINE_AUCTION_ABI,
    functionName: "listReplicaSeriesIds",
    query: {
      enabled: !!STORMLINE_AUCTION_ADDRESS,
      refetchInterval: 10000,
    },
  });
}

// Hook to get a single series by ID
export function useSeries(seriesId: string | undefined) {
  return useReadContract({
    address: STORMLINE_AUCTION_ADDRESS,
    abi: STORMLINE_AUCTION_ABI,
    functionName: "getReplicaSeries",
    args: seriesId ? [seriesId] : undefined,
    query: {
      enabled: !!STORMLINE_AUCTION_ADDRESS && !!seriesId,
      refetchInterval: 5000,
    },
  });
}

// Hook to get multiple series at once
export function useMultipleSeries(seriesIds: string[]) {
  const contracts = seriesIds.map((id) => ({
    address: STORMLINE_AUCTION_ADDRESS,
    abi: STORMLINE_AUCTION_ABI,
    functionName: "getReplicaSeries" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: {
      enabled: !!STORMLINE_AUCTION_ADDRESS && seriesIds.length > 0,
      refetchInterval: 5000,
    },
  });
}

// Hook to get bidders for a series
export function useSeriesBidders(seriesId: string | undefined) {
  return useReadContract({
    address: STORMLINE_AUCTION_ADDRESS,
    abi: STORMLINE_AUCTION_ABI,
    functionName: "getReplicaBidders",
    args: seriesId ? [seriesId] : undefined,
    query: {
      enabled: !!STORMLINE_AUCTION_ADDRESS && !!seriesId,
    },
  });
}

// Hook to get bidders for multiple series at once
export function useMultipleSeriesBidders(seriesIds: string[]) {
  const contracts = seriesIds.map((id) => ({
    address: STORMLINE_AUCTION_ADDRESS,
    abi: STORMLINE_AUCTION_ABI,
    functionName: "getReplicaBidders" as const,
    args: [id] as const,
  }));

  return useReadContracts({
    contracts,
    query: {
      enabled: !!STORMLINE_AUCTION_ADDRESS && seriesIds.length > 0,
      refetchInterval: 10000,
    },
  });
}

// Combined hook to get all auctions with their data
export function useAllAuctions() {
  const { data: seriesIds, isLoading: idsLoading, error: idsError } = useSeriesIds();
  const { data: seriesData, isLoading: dataLoading, error: dataError } = useMultipleSeries(
    (seriesIds as string[]) || []
  );

  const auctions = seriesData
    ?.map((result) => {
      if (result.status !== "success" || !result.result) return null;
      const series = result.result as SeriesSnapshot;
      return {
        ...series,
        status: getAuctionStatus(series),
        totalBidders: Number(series.totalBidders),
        tierBidders: series.tierCounts,
      };
    })
    .filter(Boolean);

  return {
    auctions,
    isLoading: idsLoading || dataLoading,
    error: idsError || dataError,
  };
}

// Hook to create a new auction series
export function useCreateSeries() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Auction Created!");
    } else if (isError) {
      showTxError(txHash, "Failed to Create Auction", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const createSeries = useCallback(
    async (params: {
      seriesId: string;
      lotLabel: string;
      bidStake: number;
      durationMinutes: number;
    }) => {
      try {
        const stakeWei = parseEther(params.bidStake.toString());
        const durationSeconds = BigInt(params.durationMinutes * 60);

        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "createReplicaSeries",
          args: [params.seriesId, params.lotLabel, stakeWei, durationSeconds],
        });

        setTxHash(hash);
        showTxSubmitted(hash, "Creating Auction...");
        return hash;
      } catch (error: any) {
        console.error("Create series error:", error);
        showSubmitError("Failed to Create Auction", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    createSeries,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}

// Hook to enter an auction with encrypted tier
export function useEnterSeries() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Bid Confirmed!");
    } else if (isError) {
      showTxError(txHash, "Bid Failed", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const enterSeries = useCallback(
    async (params: {
      seriesId: string;
      tier: Tier;
      bidStake: bigint;
      userAddress: Address;
    }) => {
      try {
        setIsEncrypting(true);
        showInfo("Encrypting Tier...", "Your bid choice will be kept secret");

        // Encrypt the tier using FHE SDK
        const { tierHandle, proof } = await encryptTier(params.tier, params.userAddress);
        setIsEncrypting(false);

        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "enterReplicaSeries",
          args: [params.seriesId, tierHandle, proof],
          value: params.bidStake,
        });

        setTxHash(hash);
        showTxSubmitted(hash, `Placing ${TIER_NAMES[params.tier]} Bid...`);
        return hash;
      } catch (error: any) {
        setIsEncrypting(false);
        console.error("Enter series error:", error);
        showSubmitError("Failed to Place Bid", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    enterSeries,
    isPending,
    isEncrypting,
    isConfirming,
    isSuccess,
    txHash,
  };
}

// Hook to settle a series
export function useSettleSeries() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Auction Settled!");
    } else if (isError) {
      showTxError(txHash, "Settlement Failed", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const settleSeries = useCallback(
    async (seriesId: string) => {
      try {
        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "settleReplicaSeries",
          args: [seriesId],
        });

        setTxHash(hash);
        showTxSubmitted(hash, "Settling Auction...");
        return hash;
      } catch (error: any) {
        console.error("Settle series error:", error);
        showSubmitError("Failed to Settle", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    settleSeries,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}

// Hook to claim prize
export function useClaimPrize() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Prize Claimed!");
    } else if (isError) {
      showTxError(txHash, "Claim Failed", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const claimPrize = useCallback(
    async (seriesId: string) => {
      try {
        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "claimReplicaPrize",
          args: [seriesId],
        });

        setTxHash(hash);
        showTxSubmitted(hash, "Claiming Prize...");
        return hash;
      } catch (error: any) {
        console.error("Claim prize error:", error);
        showSubmitError("Failed to Claim Prize", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    claimPrize,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}

// Hook to claim refund
export function useClaimRefund() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Refund Claimed!");
    } else if (isError) {
      showTxError(txHash, "Refund Failed", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const claimRefund = useCallback(
    async (seriesId: string) => {
      try {
        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "claimReplicaRefund",
          args: [seriesId],
        });

        setTxHash(hash);
        showTxSubmitted(hash, "Claiming Refund...");
        return hash;
      } catch (error: any) {
        console.error("Claim refund error:", error);
        showSubmitError("Failed to Claim Refund", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    claimRefund,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}

// Hook to cancel a series (creator only)
export function useCancelSeries() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Monitor transaction confirmation status
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      showTxSuccess(txHash, "Auction Cancelled!");
    } else if (isError) {
      showTxError(txHash, "Cancellation Failed", error?.message);
    }
  }, [txHash, isSuccess, isError, error]);

  const cancelSeries = useCallback(
    async (seriesId: string) => {
      try {
        const hash = await writeContractAsync({
          address: STORMLINE_AUCTION_ADDRESS,
          abi: STORMLINE_AUCTION_ABI,
          functionName: "cancelReplicaSeries",
          args: [seriesId],
        });

        setTxHash(hash);
        showTxSubmitted(hash, "Cancelling Auction...");
        return hash;
      } catch (error: any) {
        console.error("Cancel series error:", error);
        showSubmitError("Failed to Cancel", error.shortMessage || error.message);
        throw error;
      }
    },
    [writeContractAsync]
  );

  return {
    cancelSeries,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}
