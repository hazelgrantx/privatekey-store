import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedVault = await deploy("PrivateKeyVault", {
    from: deployer,
    log: true,
  });

  console.log(`PrivateKeyVault contract: `, deployedVault.address);
};
export default func;
func.id = "deploy_privateKeyVault"; // id required to prevent reexecution
func.tags = ["PrivateKeyVault"];
