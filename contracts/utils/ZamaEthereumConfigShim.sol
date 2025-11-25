// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import {CoprocessorConfig} from "@fhevm/solidity/lib/Impl.sol";

/**
 * @notice Temporary shim implementing the 0.9.1 `ZamaEthereumConfig` contract while the npm package
 *         bundled with this project still ships the legacy `EthereumConfig`. The implementation
 *         matches the migration guide: https://docs.zama.org/protocol/solidity-guides/development-guide/migration
 *         Once the upstream package exposes this contract, this shim (and the remapping in
 *         `hardhat.config.js`) can be removed.
 */
library ZamaConfigShim {
    error ZamaProtocolUnsupported();

    function getEthereumCoprocessorConfig() internal view returns (CoprocessorConfig memory config) {
        if (block.chainid == 1) {
            config = _getEthereumConfig();
        } else if (block.chainid == 11155111) {
            config = _getSepoliaConfig();
        } else if (block.chainid == 31337) {
            config = _getLocalConfig();
        } else {
            revert ZamaProtocolUnsupported();
        }
    }

    function getConfidentialProtocolId() internal view returns (uint256) {
        if (block.chainid == 1) {
            return _getEthereumProtocolId();
        } else if (block.chainid == 11155111) {
            return _getSepoliaProtocolId();
        } else if (block.chainid == 31337) {
            return _getLocalProtocolId();
        }
        return 0;
    }

    function _getEthereumProtocolId() private pure returns (uint256) {
        return 1;
    }

    function _getEthereumConfig() private pure returns (CoprocessorConfig memory) {
        return
            CoprocessorConfig({ACLAddress: address(0), CoprocessorAddress: address(0), KMSVerifierAddress: address(0)});
    }

    function _getSepoliaProtocolId() private pure returns (uint256) {
        return 10001;
    }

    function _getSepoliaConfig() private pure returns (CoprocessorConfig memory) {
        return
            CoprocessorConfig({
                ACLAddress: 0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D,
                CoprocessorAddress: 0x92C920834Ec8941d2C77D188936E1f7A6f49c127,
                KMSVerifierAddress: 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
            });
    }

    function _getLocalProtocolId() private pure returns (uint256) {
        return type(uint256).max;
    }

    function _getLocalConfig() private pure returns (CoprocessorConfig memory) {
        return
            CoprocessorConfig({
                ACLAddress: 0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D,
                CoprocessorAddress: 0xe3a9105a3a932253A70F126eb1E3b589C643dD24,
                KMSVerifierAddress: 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
            });
    }
}

abstract contract ZamaEthereumConfig {
    constructor() {
        FHE.setCoprocessor(ZamaConfigShim.getEthereumCoprocessorConfig());
    }

    function confidentialProtocolId() public view returns (uint256) {
        return ZamaConfigShim.getConfidentialProtocolId();
    }
}
