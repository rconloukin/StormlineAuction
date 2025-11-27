// StormlineAuction contract configuration
const DEPLOYED_ADDRESS = "0xB55a4427923658861C601098035457E33D24fDE9" as const;
const envAddress = (import.meta as any).env?.VITE_STORMLINE_AUCTION_ADDRESS as `0x${string}` | undefined;
export const STORMLINE_AUCTION_ADDRESS =
  envAddress && envAddress.startsWith("0x")
    ? envAddress
    : (DEPLOYED_ADDRESS as `0x${string}`);

// Tier definitions
export enum Tier {
  Ember = 0,
  Gale = 1,
  Flash = 2,
}

export const TIER_NAMES = ["Ember", "Gale", "Flash"] as const;
export const TIER_COLORS = {
  [Tier.Ember]: "tier-ember",
  [Tier.Gale]: "tier-gale",
  [Tier.Flash]: "tier-flash",
} as const;

// Contract constants
export const MIN_STAKE = 0.0004; // ETH
export const MIN_DURATION = 10 * 60; // 10 minutes in seconds
export const MAX_DURATION = 96 * 60 * 60; // 96 hours in seconds

// Contract ABI - Updated for encrypted tier (no weight)
export const STORMLINE_AUCTION_ABI = [
  {
    inputs: [],
    name: "AlreadyBid",
    type: "error"
  },
  {
    inputs: [],
    name: "AlreadyClaimed",
    type: "error"
  },
  {
    inputs: [],
    name: "BidMissing",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidDuration",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidStake",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidTier",
    type: "error"
  },
  {
    inputs: [],
    name: "Locked",
    type: "error"
  },
  {
    inputs: [],
    name: "NotCreator",
    type: "error"
  },
  {
    inputs: [],
    name: "NotRefundable",
    type: "error"
  },
  {
    inputs: [],
    name: "NotSettled",
    type: "error"
  },
  {
    inputs: [],
    name: "NotWinner",
    type: "error"
  },
  {
    inputs: [],
    name: "SeriesExists",
    type: "error"
  },
  {
    inputs: [],
    name: "SeriesMissing",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address"
      }
    ],
    name: "BidPlaced",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256"
      }
    ],
    name: "PrizeClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refund",
        type: "uint256"
      }
    ],
    name: "RefundClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      }
    ],
    name: "SeriesCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      },
      {
        indexed: false,
        internalType: "string",
        name: "lotLabel",
        type: "string"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bidStake",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lockTime",
        type: "uint256"
      }
    ],
    name: "SeriesCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "seriesId",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "pushAll",
        type: "bool"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "winningTier",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winnerCount",
        type: "uint256"
      }
    ],
    name: "SeriesSettled",
    type: "event"
  },
  {
    inputs: [],
    name: "MAX_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MIN_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MIN_STAKE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "cancelReplicaSeries",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "claimReplicaPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "claimReplicaRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "confidentialProtocolId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" },
      { internalType: "string", name: "lotLabel", type: "string" },
      { internalType: "uint256", name: "bidStake", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" }
    ],
    name: "createReplicaSeries",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" },
      { internalType: "externalEuint8", name: "encryptedTier", type: "bytes32" },
      { internalType: "bytes", name: "proof", type: "bytes" }
    ],
    name: "enterReplicaSeries",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" },
      { internalType: "address", name: "bidder", type: "address" }
    ],
    name: "getBidHandle",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "getReplicaBidders",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "getReplicaSeries",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "string", name: "seriesId", type: "string" },
          { internalType: "string", name: "lotLabel", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "bidStake", type: "uint256" },
          { internalType: "uint256", name: "lockTime", type: "uint256" },
          { internalType: "uint256", name: "prizePool", type: "uint256" },
          { internalType: "bool", name: "cancelled", type: "bool" },
          { internalType: "bool", name: "settled", type: "bool" },
          { internalType: "bool", name: "pushAll", type: "bool" },
          { internalType: "uint8", name: "winningTier", type: "uint8" },
          { internalType: "uint256", name: "winnerCount", type: "uint256" },
          { internalType: "uint256[3]", name: "tierCounts", type: "uint256[3]" },
          { internalType: "uint256", name: "totalBidders", type: "uint256" }
        ],
        internalType: "struct StormlineAuction.SeriesSnapshot",
        name: "snapshot",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "listReplicaSeriesIds",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "seriesId", type: "string" }
    ],
    name: "settleReplicaSeries",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Type definitions for contract data
export interface SeriesSnapshot {
  exists: boolean;
  seriesId: string;
  lotLabel: string;
  creator: `0x${string}`;
  bidStake: bigint;
  lockTime: bigint;
  prizePool: bigint;
  cancelled: boolean;
  settled: boolean;
  pushAll: boolean;
  winningTier: number;
  winnerCount: bigint;
  tierCounts: readonly [bigint, bigint, bigint];
  totalBidders: bigint;
}

export type AuctionStatus = "open" | "locked" | "settled" | "cancelled" | "push";

export function getAuctionStatus(series: SeriesSnapshot): AuctionStatus {
  if (series.cancelled) return "cancelled";
  if (series.settled && series.pushAll) return "push";
  if (series.settled) return "settled";
  if (Date.now() / 1000 >= Number(series.lockTime)) return "locked";
  return "open";
}
