# StormlineAuction Test Suite

This directory contains comprehensive tests for the StormlineAuction smart contract.

## Test Files

### `StormlineAuction.test.ts`
**Unit tests** covering individual contract functions and edge cases:

- ✅ Series Creation
  - Valid series creation
  - Duplicate series ID rejection
  - Stake validation (min/max)
  - Duration validation (min/max)
  - Series ID listing

- ✅ Bidding
  - Bid acceptance with correct stake
  - Stake amount validation
  - Lock time enforcement
  - Non-existent series rejection
  - Note: FHE encryption tests are mocked due to setup complexity

- ✅ Settlement
  - Lock time enforcement
  - No-bid scenarios (push all)
  - Double settlement prevention
  - Cancelled series handling

- ✅ Cancellation
  - Creator-only cancellation
  - Non-creator rejection
  - Settled series protection

- ✅ Prize Claims
  - Settlement requirement
  - Bid existence validation

- ✅ Refund Claims
  - Refundability conditions
  - Bid existence validation

- ✅ View Functions
  - Series details retrieval
  - Bidders array
  - Error handling for non-existent data

- ✅ Constants
  - MIN_STAKE verification
  - MIN_DURATION verification
  - MAX_DURATION verification

### `StormlineAuction.integration.test.ts`
**Integration tests** covering end-to-end scenarios:

- ✅ Complete Auction Flow - No Bids
- ✅ Complete Auction Flow - Cancellation
- ✅ Multiple Concurrent Auctions
- ✅ Edge Cases
  - Minimum stake
  - Minimum/Maximum duration
  - Long series IDs
  - Special characters in labels
- ✅ Gas Optimization Tests
- ✅ Permission Tests
  - Creator permissions
  - Public settlement
  - Cancellation restrictions

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test file:
```bash
npx hardhat test test/StormlineAuction.test.ts
npx hardhat test test/StormlineAuction.integration.test.ts
```

### Run with coverage:
```bash
npm run test:coverage
```

### Run with gas reporting:
```bash
npm run test:gas
```

## Test Coverage

The test suite covers:
- ✅ All public functions
- ✅ All custom errors
- ✅ All events
- ✅ Edge cases and boundary conditions
- ✅ Permission checks
- ✅ State transitions
- ✅ Multi-user scenarios

## Known Limitations

### FHE Encryption Tests
The current tests use **mocked FHE encryption** due to the complexity of setting up the full Zama FHE environment in a test context. Real FHE encryption tests would require:

1. Initializing the FHE library
2. Creating encrypted inputs with proper proofs
3. Setting up the KMS (Key Management Service)
4. Handling decryption verification

For production deployment, additional tests should be written using the Zama FHE test utilities.

### Recommended Additional Tests
For a production environment, consider adding:

1. **FHE Integration Tests**
   - Real encrypted tier submission
   - Tier decryption and counting
   - Winner determination based on actual tier counts

2. **Stress Tests**
   - Large number of bidders (100+)
   - Gas optimization validation
   - Storage limits

3. **Security Tests**
   - Reentrancy protection
   - Front-running scenarios
   - MEV protection

4. **Fuzz Testing**
   - Random stake amounts
   - Random durations
   - Random series IDs

## Dependencies

- `@nomicfoundation/hardhat-toolbox`
- `@nomicfoundation/hardhat-network-helpers`
- `chai`
- `ethers`

## Test Network Configuration

Tests run on Hardhat's local network with:
- Automatic mining
- Deterministic accounts
- Time manipulation support
- Gas reporting

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Group related tests in `describe` blocks
3. Use descriptive test names
4. Add comments for complex scenarios
5. Ensure tests are deterministic and isolated
