import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "PrivateKeyVault";

task("task:vault-address", "Prints the PrivateKeyVault deployment address").setAction(async (_, hre) => {
  const deployment = await hre.deployments.get(CONTRACT_NAME);
  console.log(`${CONTRACT_NAME} address: ${deployment.address}`);
});

task("task:vault-store", "Encrypts and stores helper address plus ciphertext")
  .addParam("helper", "Helper address used to encrypt the private key")
  .addParam("cipher", "Encrypted private key payload as hex string")
  .addOptionalParam("contract", "Optional PrivateKeyVault contract address")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const { deployments, ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArgs.contract ? { address: taskArgs.contract as string } : await deployments.get(CONTRACT_NAME);
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const encryptedHelperAddress = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .addAddress(taskArgs.helper as string)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .storeKeyRecord(encryptedHelperAddress.handles[0], taskArgs.cipher as string, encryptedHelperAddress.inputProof);
    console.log(`Submitted storeKeyRecord tx: ${tx.hash}`);
    await tx.wait();
    console.log(`Stored helper address for ${signer.address}`);
  });

task("task:vault-get-private-key", "Reads the encrypted private key for an owner")
  .addOptionalParam("owner", "Owner address, defaults to signer")
  .addOptionalParam("contract", "Optional PrivateKeyVault contract address")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const { deployments, ethers } = hre;

    const deployment = taskArgs.contract ? { address: taskArgs.contract as string } : await deployments.get(CONTRACT_NAME);
    const [signer] = await ethers.getSigners();
    const owner = (taskArgs.owner as string) ?? signer.address;

    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);
    const ciphertext = await contract.getEncryptedPrivateKey(owner);
    console.log(`Encrypted private key for ${owner}: ${ciphertext}`);
  });

task("task:vault-decrypt-helper", "Decrypts the helper address for the connected signer")
  .addOptionalParam("contract", "Optional PrivateKeyVault contract address")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const { deployments, ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArgs.contract ? { address: taskArgs.contract as string } : await deployments.get(CONTRACT_NAME);
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const handle = await contract.getEncryptedHelperAddress(signer.address);

    if (handle === ethers.ZeroHash) {
      console.log("No helper address stored for signer");
      return;
    }

    const clearAddress = await fhevm.userDecryptEaddress(handle, deployment.address, signer);
    console.log(`Decrypted helper address: ${clearAddress}`);
  });
