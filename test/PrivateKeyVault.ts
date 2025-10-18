import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = await ethers.getContractFactory("PrivateKeyVault");
  const contract = await factory.deploy();
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrivateKeyVault", function () {
  let signers: Signers;
  let contract: any;
  let contractAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite runs only against the mock FHEVM environment");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("stores and retrieves encrypted key material", async function () {
    const helperWallet = ethers.Wallet.createRandom();
    const helperAddress = helperWallet.address;
    const encryptedPrivateKey = ethers.hexlify(ethers.randomBytes(48));

    const encryptedAddressInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(helperAddress)
      .encrypt();

    await expect(
      contract.connect(signers.alice).storeKeyRecord(
        encryptedAddressInput.handles[0],
        encryptedPrivateKey,
        encryptedAddressInput.inputProof,
      ),
    ).to.emit(contract, "KeyRecordStored").withArgs(signers.alice.address);

    expect(await contract.hasKeyRecord(signers.alice.address)).to.equal(true);

    const onChainCiphertext = await contract.getEncryptedPrivateKey(signers.alice.address);
    expect(onChainCiphertext).to.equal(encryptedPrivateKey);

    const encryptedHandle = await contract.getEncryptedHelperAddress(signers.alice.address);
    expect(encryptedHandle).to.not.equal(ethers.ZeroHash);

    const decryptedAddress = await fhevm.userDecryptEaddress(
      encryptedHandle,
      contractAddress,
      signers.alice,
    );

    expect(ethers.getAddress(decryptedAddress)).to.equal(helperAddress);
  });

  it("clears existing record", async function () {
    const helperWallet = ethers.Wallet.createRandom();
    const helperAddress = helperWallet.address;
    const encryptedPrivateKey = ethers.hexlify(ethers.randomBytes(32));

    const encryptedAddressInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(helperAddress)
      .encrypt();

    await contract.connect(signers.alice).storeKeyRecord(
      encryptedAddressInput.handles[0],
      encryptedPrivateKey,
      encryptedAddressInput.inputProof,
    );

    await expect(contract.connect(signers.alice).clearKeyRecord())
      .to.emit(contract, "KeyRecordCleared")
      .withArgs(signers.alice.address);

    expect(await contract.hasKeyRecord(signers.alice.address)).to.equal(false);
    await expect(contract.getEncryptedPrivateKey(signers.alice.address)).to.be.revertedWithCustomError(
      contract,
      "RecordNotFound",
    );
  });
});
