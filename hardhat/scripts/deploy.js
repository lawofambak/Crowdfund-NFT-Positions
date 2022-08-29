const hre = require("hardhat");

const GOERLI_TEST_TOKEN = "0x5FADa42917a63bA7861c9F0d8bDC7FA58c6e9204";

async function main() {
  // Deploy NftPositionManager contract first
  const NftPositionManager = await hre.ethers.getContractFactory("NftPositionManager");
  const nftPositionManager = await NftPositionManager.deploy();

  await nftPositionManager.deployed();

  console.log("NftPositionManager contract address:", nftPositionManager.address);

  // Deploy CrowdfundPlatform contract after w/ NftPositionManager address
  const CrowdfundPlatform = await hre.ethers.getContractFactory("CrowdfundPlatform");
  const crowdfundPlatform = await CrowdfundPlatform.deploy(GOERLI_TEST_TOKEN, nftPositionManager.address);

  await crowdfundPlatform.deployed();

  console.log("CrowdfundPlatform contract address:", crowdfundPlatform.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
