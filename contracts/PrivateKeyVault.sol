// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PrivateKeyVault
/// @notice Stores encrypted wallet metadata using Zama FHEVM
contract PrivateKeyVault is SepoliaConfig {
    /// @dev Raised when attempting to interact with a missing record
    error RecordNotFound();

    /// @dev Raised when provided encrypted payload is empty
    error EmptyEncryptedPrivateKey();

    struct KeyRecord {
        eaddress encryptedHelperAddress;
        bytes encryptedPrivateKey;
    }

    mapping(address => KeyRecord) private _records;
    mapping(address => bool) private _hasRecord;

    event KeyRecordStored(address indexed owner);
    event KeyRecordCleared(address indexed owner);

    /// @notice Stores an encrypted helper address and encrypted private key for the caller
    /// @param encryptedAddress The encrypted helper address handle
    /// @param encryptedPrivateKey The ciphertext representing the encrypted private key
    /// @param inputProof The validity proof associated with the encrypted address
    function storeKeyRecord(
        externalEaddress encryptedAddress,
        bytes calldata encryptedPrivateKey,
        bytes calldata inputProof
    ) external {
        if (encryptedPrivateKey.length == 0) {
            revert EmptyEncryptedPrivateKey();
        }

        eaddress storedAddress = FHE.fromExternal(encryptedAddress, inputProof);

        _records[msg.sender] = KeyRecord({
            encryptedHelperAddress: storedAddress,
            encryptedPrivateKey: encryptedPrivateKey
        });
        _hasRecord[msg.sender] = true;

        FHE.allow(storedAddress, msg.sender);
        FHE.allowThis(storedAddress);

        emit KeyRecordStored(msg.sender);
    }

    /// @notice Removes the stored record for the caller
    function clearKeyRecord() external {
        if (!_hasRecord[msg.sender]) {
            revert RecordNotFound();
        }

        delete _records[msg.sender];
        delete _hasRecord[msg.sender];

        emit KeyRecordCleared(msg.sender);
    }

    /// @notice Returns whether a record exists for the given owner
    /// @param owner The address to query
    function hasKeyRecord(address owner) external view returns (bool) {
        return _hasRecord[owner];
    }

    /// @notice Returns the encrypted helper address for an owner
    /// @param owner The owner whose encrypted helper address is requested
    function getEncryptedHelperAddress(address owner) external view returns (eaddress) {
        if (!_hasRecord[owner]) {
            revert RecordNotFound();
        }

        return _records[owner].encryptedHelperAddress;
    }

    /// @notice Returns the encrypted private key ciphertext for an owner
    /// @param owner The owner whose encrypted private key is requested
    function getEncryptedPrivateKey(address owner) external view returns (bytes memory) {
        if (!_hasRecord[owner]) {
            revert RecordNotFound();
        }

        return _records[owner].encryptedPrivateKey;
    }
}
