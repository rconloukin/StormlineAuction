# StormlineAuction

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-purple.svg)](https://docs.zama.ai/fhevm)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.3-yellow.svg)](https://hardhat.org/)

**A privacy-preserving sealed-bid auction platform powered by Zama's Fully Homomorphic Encryption (fhEVM), implementing minority game theory mechanics.**

StormlineAuction is a decentralized auction system where **the tier with the fewest bidders wins** — creating a fascinating strategic paradox at the heart of game theory. All bids are encrypted on-chain using FHE technology, ensuring complete privacy until settlement.

🔗 **[Live Demo](https://stormlineauction.vercel.app/)** | 📺 **[Demo Video](https://stormlineauction.vercel.app/how-to-play)**

---

## 🎯 Table of Contents

- [Core Gameplay: The Minority Game](#-core-gameplay-the-minority-game)
- [The Strategic Paradox](#-the-strategic-paradox)
- [Contract Architecture](#-contract-architecture)
- [Privacy & Encryption](#-privacy--encryption)
- [Game Flow](#-game-flow)
- [Unit Testing](#-unit-testing)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎲 Core Gameplay: The Minority Game

### What is the Minority Game?

StormlineAuction implements a **minority game** — a strategic scenario from game theory where participants win by being part of the smallest group. This creates a fundamentally different dynamic from traditional auctions:

**Traditional Auction**: Highest bidder wins
**StormlineAuction**: Tier with **fewest bidders** wins (and all winners split the prize pool equally)

### The Three Tiers

Every auction has three bidding tiers:

| Tier | Description | Strategy |
|------|-------------|----------|
| **Ember** 🔥 | Conservative Choice | Often chosen by risk-averse players, but if too many choose it, becomes the most crowded tier |
| **Gale** 💨 | Balanced Choice | The middle ground that attracts moderate risk-takers, or could be overlooked entirely |
| **Flash** ⚡ | Aggressive Choice | Seems risky, but if everyone avoids it, becomes the winning minority |

**No tier is inherently better than others.** Success depends entirely on predicting other players' choices and finding the true minority.

---

## 🧠 The Strategic Paradox

This is where the game becomes intellectually fascinating. Consider this scenario:

### Example: The Paradox in Action

**Scenario**: 100 players participate in an auction

**Initial Thought Process**:
- "Most people will choose Ember because it seems safe"
- "So I'll choose Gale or Flash to be in the minority"

**The Paradox**:
- If **everyone thinks this way**, most players choose Gale or Flash
- Ember becomes the actual minority and **wins**!
- The contrarian choice becomes the mainstream choice

### Real-World Distribution Example

```
Round 1: Everyone tries to outsmart each other
├── Ember: 20 bidders
├── Gale: 45 bidders  ← Most crowded (everyone tried to be contrarian)
└── Flash: 35 bidders

Winner: Ember (20 bidders) ✓ — The "obvious" choice won because everyone avoided it!
```

### Strategic Considerations

✅ **Successful Strategies**:
- Predict other players' psychology
- Contrarian thinking: popular ≠ good choice
- Analyze historical patterns from previous auctions
- Consider the player pool size and experience level

⚠️ **Common Traps**:
- Following the crowd (herd mentality)
- Assuming unpopular options are guaranteed wins
- Overthinking and meta-gaming too deeply
- Not adapting to changing player behaviors

### Why This Matters

The minority game creates a **self-balancing mechanism**:
1. If a strategy becomes too popular, it stops working
2. No dominant strategy exists (Nash equilibrium is inherently unstable)
3. Every round is independent and requires fresh analysis
4. Skill and psychology matter more than luck

This is fundamentally different from gambling — it's a **strategic competition** where understanding human behavior and game theory provides a genuine edge.

---

## 🏗️ Contract Architecture

### Smart Contract Structure

StormlineAuction is built on Solidity 0.8.24 with Zama's fhEVM 0.9.1 library for fully homomorphic encryption.

#### Core Components

```
StormlineAuction.sol (298 lines)
├── State Variables
│   ├── seriesById: mapping(string => Series)
│   ├── bids: mapping(string => mapping(address => Bid))
│   └── seriesIds: string[]
│
├── Structs
│   ├── Series (auction metadata & state)
│   ├── Bid (encrypted tier + claim status)
│   └── SeriesSnapshot (public view data)
│
├── Constants
│   ├── MIN_STAKE: 0.0004 ETH
│   ├── MIN_DURATION: 10 minutes
│   └── MAX_DURATION: 96 hours
│
└── Functions
    ├── Series Management (create, cancel)
    ├── Bidding (enter, encrypted submission)
    ├── Settlement (tier counting, winner determination)
    ├── Claims (prize & refund distribution)
    └── Views (read auction state)
```

### Key Data Structures

#### Series Struct
```solidity
struct Series {
    bool exists;           // Series validity
    string seriesId;       // Unique identifier
    string lotLabel;       // Auction description
    address creator;       // Creator address
    uint256 bidStake;      // Required bid amount (≥ 0.0004 ETH)
    uint256 lockTime;      // Timestamp when bidding closes
    uint256 prizePool;     // Total ETH collected
    bool cancelled;        // Cancellation flag
    bool settled;          // Settlement completion flag
    bool pushAll;          // Refund-all flag (no valid bids)
    uint8 winningTier;     // 0-2 valid, 255 unset
    uint256 winnerCount;   // Number of winning bidders
    uint256[3] tierCounts; // Revealed counts [Ember, Gale, Flash]
    address[] bidders;     // All participants
}
```

#### Bid Struct
```solidity
struct Bid {
    bool exists;           // Bid validity
    bool claimed;          // Claim status
    euint8 encryptedTier;  // FHE-encrypted tier (0, 1, or 2)
}
```

### Function Categories

#### 1. Series Creation
```solidity
function createReplicaSeries(
    string calldata seriesId,
    string calldata lotLabel,
    uint256 bidStake,
    uint256 duration
) external
```
- **Access**: Anyone can create
- **Validation**:
  - `bidStake ≥ 0.0004 ETH`
  - `10 minutes ≤ duration ≤ 96 hours`
  - Unique `seriesId`
- **Effects**: Initializes new auction series

#### 2. Encrypted Bidding
```solidity
function enterReplicaSeries(
    string calldata seriesId,
    externalEuint8 encryptedTier,
    bytes calldata proof
) external payable
```
- **Access**: Any address before lockTime
- **Validation**:
  - Exact `bidStake` payment
  - Before `lockTime`
  - No duplicate bids (unless previously claimed)
- **Encryption**: Uses Zama FHE SDK proof system
- **Effects**:
  - Stores encrypted tier choice
  - Adds to prize pool
  - Registers bidder

#### 3. Settlement
```solidity
function settleReplicaSeries(string calldata seriesId) external
```
- **Access**: Any address after lockTime
- **Logic**:
  1. Verify lockTime passed
  2. Count bidders per tier (via FHE decryption)
  3. Determine tier with **minimum count** (minority wins)
  4. Handle ties via `blockhash` randomness
  5. Set `pushAll=true` if no valid bids
- **Effects**: Marks series as settled, sets winning tier

#### 4. Prize Claims
```solidity
function claimReplicaPrize(string calldata seriesId) external
```
- **Access**: Winners after settlement
- **Validation**:
  - Series settled
  - Bidder participated
  - Tier matches winning tier (verified via FHE)
  - Not previously claimed
- **Payout**: `prizePool / winnerCount`

#### 5. Refund Claims
```solidity
function claimReplicaRefund(string calldata seriesId) external
```
- **Access**: Bidders in cancelled or pushAll series
- **Validation**:
  - Series cancelled OR settled with pushAll
  - Bidder participated
  - Not previously claimed
- **Refund**: Full `bidStake` returned

### FHE Integration Details

#### Encryption Flow
```
Client Side (Frontend)
    ↓
User selects tier (0, 1, or 2)
    ↓
Zama FHE SDK generates:
    - externalEuint8 (encrypted value)
    - bytes proof (ZK proof)
    ↓
Submit to smart contract
    ↓
Contract Side (StormlineAuction.sol)
    ↓
FHE.fromExternal(encryptedTier, proof)
    ↓
Store as euint8 encryptedTier
    ↓
FHE.allowThis(tier) — contract can operate on it
FHE.allow(tier, msg.sender) — user can read it
    ↓
Settlement: Decrypt all tiers to count
```

#### Privacy Guarantees

✅ **Before Settlement**:
- Tier choices stored as `euint8` ciphertext
- **Nobody can know** which tier a player chose (including contract creator)
- Operations on encrypted data via FHE homomorphic properties
- Prevents front-running, bid manipulation, collusion

✅ **After Settlement**:
- System decrypts tier counts to determine winner
- Individual choices remain encrypted
- Only aggregate counts revealed (`tierCounts[3]`)
- Claims verified via FHE tier matching

### Events

```solidity
event SeriesCreated(string indexed seriesId, string lotLabel, uint256 bidStake, uint256 lockTime);
event BidPlaced(string indexed seriesId, address indexed bidder);
event SeriesSettled(string indexed seriesId, bool pushAll, uint8 winningTier, uint256 winnerCount);
event SeriesCancelled(string indexed seriesId);
event PrizeClaimed(string indexed seriesId, address indexed bidder, uint256 payout);
event RefundClaimed(string indexed seriesId, address indexed bidder, uint256 refund);
```

### Custom Errors

Gas-efficient error handling:
```solidity
error SeriesExists();
error SeriesMissing();
error InvalidStake();
error InvalidDuration();
error InvalidTier();
error Locked();
error AlreadyBid();
error BidMissing();
error NotSettled();
error NotWinner();
error AlreadyClaimed();
error NotRefundable();
error NotCreator();
```

---

## 🔐 Privacy & Encryption

### Zama fhEVM Technology

StormlineAuction leverages **Fully Homomorphic Encryption (FHE)** via Zama's fhEVM library, enabling computation on encrypted data without ever decrypting it.

#### What is fhEVM?

- **Fully Homomorphic Encryption**: Cryptographic system that allows computation on encrypted data
- **fhEVM**: Zama's implementation for Ethereum Virtual Machine compatibility
- **euint8**: Encrypted 8-bit unsigned integer type (used for tier: 0-2)

#### Implementation Details

**Contract Side** (fhEVM 0.9.1):
```solidity
import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "./utils/ZamaEthereumConfigShim.sol";

contract StormlineAuction is ZamaEthereumConfig {
    struct Bid {
        euint8 encryptedTier;  // Encrypted tier value
    }

    function enterReplicaSeries(
        string calldata seriesId,
        externalEuint8 encryptedTier,
        bytes calldata proof
    ) external payable {
        euint8 tier = FHE.fromExternal(encryptedTier, proof);
        FHE.allowThis(tier);  // Contract can operate
        FHE.allow(tier, msg.sender);  // User can read
    }
}
```

**Client Side** (@zama-fhe/relayer-sdk 0.3.0-5):
```typescript
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance({ network });
const tierValue = 0; // Ember
const { handles, proof } = await instance.encrypt8(tierValue);
await contract.enterReplicaSeries(seriesId, handles[0], proof);
```

#### Security Properties

| Property | Description | Benefit |
|----------|-------------|---------|
| **Confidentiality** | Tier choices encrypted on-chain | No one can see your bid |
| **Computation on Ciphertext** | Settlement counts encrypted bids | No decryption needed until final reveal |
| **Verifiability** | ZK proofs validate encrypted inputs | Prevents invalid tier values |
| **Permission System** | `FHE.allow()` controls access | Only authorized parties can decrypt |

---

## 🎮 Game Flow

### Complete Auction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SERIES CREATION                                          │
│    Anyone creates auction with:                             │
│    - seriesId (unique identifier)                           │
│    - lotLabel (description)                                 │
│    - bidStake (≥ 0.0004 ETH)                               │
│    - duration (10 min - 96 hours)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BIDDING PHASE (OPEN)                                    │
│    Players submit encrypted tier choices:                   │
│    - Select tier (Ember/Gale/Flash)                        │
│    - Generate FHE proof via SDK                            │
│    - Submit with exact bidStake                            │
│    - Tier stored as encrypted euint8                       │
│                                                             │
│    Status: Before lockTime                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. LOCK TIME REACHED                                        │
│    Bidding closes automatically                             │
│    Encrypted bids frozen on-chain                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SETTLEMENT                                               │
│    Anyone can trigger settlement:                           │
│    - Decrypt all tier choices via FHE                      │
│    - Count bidders: [Ember, Gale, Flash]                  │
│    - Find minimum count (minority wins!)                   │
│    - Handle ties via blockhash randomness                  │
│    - Set winningTier and winnerCount                       │
│                                                             │
│    Edge Case: If no valid bids → pushAll = true           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PRIZE DISTRIBUTION                                       │
│    Winners claim prizes:                                    │
│    - claimReplicaPrize() if tier matches winning tier     │
│    - Payout: prizePool / winnerCount                       │
│    - Split equally among all winners                       │
│                                                             │
│    OR Refunds (if cancelled/pushAll):                      │
│    - claimReplicaRefund()                                  │
│    - Full bidStake returned                                │
└─────────────────────────────────────────────────────────────┘
```

### State Transitions

```
CREATED → OPEN → LOCKED → SETTLED → CLAIMED
          ↓
       CANCELLED → REFUNDED
```

---

## 🧪 Unit Testing

### Test Suite Overview

StormlineAuction includes a **comprehensive test suite** with 50+ test cases covering all contract functionality, edge cases, and integration scenarios.

#### Test Files

```
test/
├── StormlineAuction.test.ts              (12.4 KB)
│   └── Unit tests for individual functions
│
├── StormlineAuction.integration.test.ts  (9.3 KB)
│   └── End-to-end integration scenarios
│
└── README.md                             (4.6 KB)
    └── Test documentation
```

### Coverage Breakdown

#### ✅ Unit Tests (`StormlineAuction.test.ts`)

**Series Creation** (6 tests):
- ✓ Valid series creation
- ✓ Duplicate series ID rejection
- ✓ Stake validation (min/max)
- ✓ Duration validation (min/max)
- ✓ Series ID listing
- ✓ Event emission verification

**Bidding** (8 tests):
- ✓ Bid acceptance with correct stake
- ✓ Stake amount validation (exact match required)
- ✓ Lock time enforcement (no bids after lock)
- ✓ Non-existent series rejection
- ✓ Prize pool accumulation
- ✓ Bidder array updates
- ✓ Duplicate bid prevention
- ✓ Event emission verification

**Settlement** (12 tests):
- ✓ Lock time enforcement (cannot settle early)
- ✓ No-bid scenarios (pushAll flag)
- ✓ Double settlement prevention
- ✓ Cancelled series handling
- ✓ Winner determination logic
- ✓ Tier count calculations
- ✓ Winning tier randomness (on ties)
- ✓ Winner count accuracy
- ✓ State transitions
- ✓ Event emission verification
- ✓ Edge case: single bidder
- ✓ Edge case: all same tier

**Cancellation** (4 tests):
- ✓ Creator-only cancellation
- ✓ Non-creator rejection
- ✓ Settled series protection
- ✓ Event emission verification

**Prize Claims** (8 tests):
- ✓ Settlement requirement
- ✓ Bid existence validation
- ✓ Winner verification
- ✓ Double claim prevention
- ✓ Correct payout calculation
- ✓ ETH transfer success
- ✓ Claimed flag update
- ✓ Event emission verification

**Refund Claims** (6 tests):
- ✓ Refundability conditions (cancelled/pushAll)
- ✓ Bid existence validation
- ✓ Double refund prevention
- ✓ Full stake return
- ✓ ETH transfer success
- ✓ Event emission verification

**View Functions** (4 tests):
- ✓ Series details retrieval
- ✓ Bidders array access
- ✓ Bid handle generation (FHE)
- ✓ Error handling for non-existent data

**Constants** (3 tests):
- ✓ MIN_STAKE = 0.0004 ETH
- ✓ MIN_DURATION = 10 minutes
- ✓ MAX_DURATION = 96 hours

#### ✅ Integration Tests (`StormlineAuction.integration.test.ts`)

**Complete Flows** (3 tests):
- ✓ Complete auction lifecycle (creation → bid → settle → claim)
- ✓ No bids scenario (pushAll refunds)
- ✓ Cancellation workflow (refunds)

**Concurrent Auctions** (1 test):
- ✓ Multiple series running simultaneously
- ✓ Independent state management
- ✓ Separate prize pools

**Edge Cases** (5 tests):
- ✓ Minimum stake (0.0004 ETH)
- ✓ Minimum duration (10 minutes)
- ✓ Maximum duration (96 hours)
- ✓ Long series IDs (100+ characters)
- ✓ Special characters in labels

**Gas Optimization** (2 tests):
- ✓ Gas usage tracking
- ✓ Performance benchmarks

**Permissions** (3 tests):
- ✓ Creator-only functions
- ✓ Public settlement access
- ✓ Cancellation restrictions

### Running Tests

#### Install Dependencies
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

#### Run All Tests
```bash
npm test
```

#### Run Specific Test File
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

#### Coverage Report
```bash
npm run test:coverage
```

#### Gas Reporting
```bash
npm run test:gas
```

### Example Test Output

```bash
$ npm test

StormlineAuction
  Series Creation
    ✓ Should create a new series (125ms)
    ✓ Should reject duplicate series ID (78ms)
    ✓ Should reject stake below minimum (45ms)
    ✓ Should reject duration below minimum (42ms)
    ✓ Should reject duration above maximum (43ms)
    ✓ Should list all series IDs (89ms)

  Bidding
    ✓ Should accept bid with correct stake (156ms)
    ✓ Should reject bid with incorrect stake (67ms)
    ✓ Should reject bid after lock time (98ms)
    ✓ Should add bidder to prize pool (134ms)

  Settlement
    ✓ Should settle after lock time (234ms)
    ✓ Should set pushAll if no bids (123ms)
    ✓ Should prevent double settlement (145ms)

  ... (50+ total tests)

51 passing (8.9s)
```

### Testing Philosophy

**Comprehensive Coverage**: Every public function, error case, and state transition tested

**Isolation**: Each test runs independently with fresh contract state

**Edge Cases**: Boundary conditions, invalid inputs, race conditions covered

**Integration**: End-to-end flows validate complete user journeys

**Gas Efficiency**: Gas reporting identifies optimization opportunities

### Known Test Limitations

⚠️ **FHE Encryption Mocking**

Current tests use **mocked FHE encryption** for simplicity. Production deployment should include:

1. Real FHE library initialization
2. Actual encrypted input generation with proofs
3. KMS (Key Management Service) setup
4. Decryption verification tests

**Recommended Additional Tests for Production**:
- Real FHE tier encryption/decryption
- Threshold decryption simulation
- Large-scale stress tests (100+ bidders)
- Reentrancy protection verification
- Front-running scenario tests
- MEV protection validation

---

## 🛠️ Technology Stack

### Smart Contract

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract language |
| **Hardhat** | 2.26.3 | Development framework |
| **@fhevm/solidity** | 0.9.1 | Zama FHE library for Solidity |
| **@fhevm/hardhat-plugin** | 0.3.0-0 | Hardhat integration for FHE |
| **@fhevm/mock-utils** | 0.3.0-0 | FHE testing utilities |
| **ethers.js** | 6.15.0 | Ethereum interaction library |
| **TypeScript** | 5.8.3 | Type-safe testing |

#### Hardhat Configuration
```typescript
// hardhat.config.ts
{
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 1 },
      evmVersion: "cancun",
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111
    }
  }
}
```

### Frontend Application

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool & dev server |
| **React Router** | 6.30.1 | SPA routing |
| **Wagmi** | 3.0.2 | React hooks for Ethereum |
| **RainbowKit** | 2.2.9 | Wallet connection UI |
| **Viem** | 2.40.3 | TypeScript Ethereum library |
| **@tanstack/react-query** | 5.90.11 | Async state management |
| **@zama-fhe/relayer-sdk** | 0.3.0-5 | FHE encryption SDK |

#### UI Libraries

| Component | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **Radix UI** | Various | Accessible component primitives |
| **Framer Motion** | 12.23.24 | Animation library |
| **Lucide React** | 0.462.0 | Icon library |
| **Recharts** | 2.15.4 | Data visualization |
| **Sonner** | 1.7.4 | Toast notifications |
| **Next Themes** | 0.3.0 | Dark mode support |
| **Zustand** | 5.0.8 | State management |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.32.0 | Code linting |
| **TypeScript ESLint** | 8.38.0 | TS-specific linting |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |
| **PostCSS** | 8.5.6 | CSS processing |

### Testing Dependencies

```json
{
  "@nomicfoundation/hardhat-toolbox": "^3.1.2",
  "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
  "@types/chai": "^4.3.0",
  "@types/mocha": "^10.0.0",
  "chai": "^4.3.0"
}
```

### Network Configuration

**Sepolia Testnet** (Primary):
- RPC: `https://ethereum-sepolia-rpc.publicnode.com`
- Chain ID: 11155111
- Explorer: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)

**Hardhat Local**:
- RPC: `http://localhost:8545`
- Chain ID: 31337

---

## 📦 Installation & Setup

### Prerequisites

- Node.js ≥ 18.0.0
- npm or yarn
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/StormlineAuction.git
cd StormlineAuction
```

### 2. Install Dependencies

#### Smart Contract
```bash
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create `.env` file in project root:

```env
# Deployment
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security**: Never commit `.env` file. Add to `.gitignore`.

### 4. Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### 5. Run Tests

```bash
npm test
```

### 6. Deploy to Sepolia

```bash
npm run deploy
```

Save the deployed contract address for frontend configuration.

### 7. Run Frontend

```bash
cd frontend
npm run dev
```

Access at: `http://localhost:5173`

---

## 🚀 Deployment

### Smart Contract Deployment

#### Sepolia Testnet

```bash
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
PRIVATE_KEY="0x..." \
npx hardhat run scripts/deploy.js --network sepolia
```

**Deployment Script** (`scripts/deploy.js`):
```javascript
const { ethers } = require("hardhat");

async function main() {
  const StormlineAuction = await ethers.getContractFactory("StormlineAuction");
  const contract = await StormlineAuction.deploy();
  await contract.deployed();

  console.log("StormlineAuction deployed to:", contract.address);
}

main();
```

### Frontend Deployment (Vercel)

#### Prerequisites
```bash
npm install -g vercel
```

#### Deploy

```bash
cd frontend

# Create vercel.json for SPA routing
cat > vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
EOF

# Build
npm run build

# Deploy
VERCEL_ORG_ID="" \
VERCEL_PROJECT_ID="" \
vercel --token YOUR_VERCEL_TOKEN --name stormlineauction --prod --yes
```

**Why COOP/COEP Headers?**

Zama FHE SDK requires `SharedArrayBuffer`, which needs Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers.

#### Dependency Conflict Resolution

Create `.npmrc`:
```
legacy-peer-deps=true
```

This resolves RainbowKit 2.2.9 / Wagmi 3.0.2 peer dependency conflicts.

### Update Contract Address

After deployment, update frontend config:

**`frontend/src/config/contracts.ts`**:
```typescript
export const STORMLINE_AUCTION_ADDRESS = "0x..."; // Your deployed address
```

---

## 📁 Project Structure

```
StormlineAuction/
├── contracts/
│   ├── StormlineAuction.sol          # Main auction contract
│   └── utils/
│       └── ZamaEthereumConfigShim.sol # Zama config helper
│
├── test/
│   ├── StormlineAuction.test.ts          # Unit tests
│   ├── StormlineAuction.integration.test.ts # Integration tests
│   └── README.md                         # Test documentation
│
├── scripts/
│   └── deploy.js                     # Deployment script
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── layout/             # Layout components (Header, Footer)
│   │   │   ├── ui/                 # UI primitives (shadcn)
│   │   │   └── features/           # Feature components
│   │   ├── pages/                  # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── MyBids.tsx
│   │   │   └── HowToPlay.tsx       # Gameplay explanation
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities
│   │   ├── config/                 # Configuration files
│   │   └── App.tsx                 # Main app component
│   ├── public/
│   │   └── demo.mp4                # Demo video
│   ├── vercel.json                 # Vercel SPA config
│   └── package.json
│
├── hardhat.config.ts               # Hardhat configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── .env.example                    # Environment template
└── README.md                       # This file
```

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Test** thoroughly: `npm test`
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Code Standards

- Follow existing code style
- Write comprehensive tests for new features
- Update documentation as needed
- Keep commits atomic and well-described
- Run linter before committing: `npm run lint`

### Test Requirements

All PRs must include:
- ✅ Unit tests for new functions
- ✅ Integration tests for new features
- ✅ Gas optimization analysis
- ✅ Documentation updates

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 StormlineAuction

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links

- **Live Demo**: [https://stormlineauction.vercel.app](https://stormlineauction.vercel.app)
- **Zama Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat**: [https://hardhat.org](https://hardhat.org)
- **Sepolia Faucet**: [https://sepoliafaucet.com](https://sepoliafaucet.com)

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/StormlineAuction/issues)
- **Discussions**: [Join discussions](https://github.com/yourusername/StormlineAuction/discussions)

---

## 🙏 Acknowledgments

- **Zama** for pioneering FHE technology and fhEVM
- **Hardhat** team for excellent development tools
- **RainbowKit** and **Wagmi** for Web3 connection infrastructure
- **shadcn/ui** for beautiful UI components
- Game theory researchers for minority game insights

---

**Built with ❤️ using Zama FHE Technology**

*Privacy-first. Strategy-driven. Decentralized.*
