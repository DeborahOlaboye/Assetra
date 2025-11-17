import { ethers, upgrades } from "hardhat";
import { parseUnits, AddressZero } from "ethers";

async function main() {
  console.log("Deploying Assetra Smart Contracts to Base...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const bal = await deployer.getBalance();
  console.log("Account balance:", bal.toString());

  // 1. Deploy KYC Registry
  console.log("\n1. Deploying KYC Registry...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await upgrades.deployProxy(KYCRegistry, [], {
    initializer: "initialize",
    kind: "uups",
  });
  await kycRegistry.waitForDeployment();
  const kycRegistryAddr = await kycRegistry.getAddress();
  console.log("KYC Registry deployed to:", kycRegistryAddr);

  // 2. Deploy Asset NFT
  console.log("\n2. Deploying Asset NFT...");
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await upgrades.deployProxy(AssetNFT, [], {
    initializer: "initialize",
    kind: "uups",
  });
  await assetNFT.waitForDeployment();
  const assetNFTAddr = await assetNFT.getAddress();
  console.log("Asset NFT deployed to:", assetNFTAddr);

  // 3. Deploy Fractional Share (example for token ID 1)
  console.log("\n3. Deploying Fractional Share...");
  const FractionalShare = await ethers.getContractFactory("FractionalShare");
  const fractionalShare = await upgrades.deployProxy(
    FractionalShare,
    ["Assetra Fractional Share", "AFS", 1, kycRegistryAddr],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );
  await fractionalShare.waitForDeployment();
  const fractionalShareAddr = await fractionalShare.getAddress();
  console.log("Fractional Share deployed to:", fractionalShareAddr);

  // 4. Deploy Timelock for Governance
  console.log("\n4. Deploying Timelock Controller...");
  const minDelay = 3600; // 1 hour
  const proposers: string[] = [];
  const executors: string[] = [];
  const admin = deployer.address;

  const TimelockController = await ethers.getContractFactory(
    "TimelockControllerUpgradeable"
  );
  const timelock = await upgrades.deployProxy(
    TimelockController,
    [minDelay, proposers, executors, admin],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );
  await timelock.waitForDeployment();
  const timelockAddr = await timelock.getAddress();
  console.log("Timelock Controller deployed to:", timelockAddr);

  // 5. Deploy Governance
  console.log("\n5. Deploying Asset Governance...");
  const votingDelay = 1; // 1 block
  const votingPeriod = 50400; // 1 week (~12s per block on Base)
  const proposalThreshold = parseUnits("1000", 18); // 1000 tokens
  const quorumPercentage = 4; // 4%

  const AssetGovernance = await ethers.getContractFactory("AssetGovernance");
  const governance = await upgrades.deployProxy(
    AssetGovernance,
    [
      fractionalShareAddr,
      timelockAddr,
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorumPercentage,
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );
  await governance.waitForDeployment();
  const governanceAddr = await governance.getAddress();
  console.log("Asset Governance deployed to:", governanceAddr);

  // Configure Timelock roles
  console.log("\n6. Configuring Timelock roles...");
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

  await timelock.grantRole(PROPOSER_ROLE, governance.address);
  await timelock.grantRole(EXECUTOR_ROLE, AddressZero); // Anyone can execute
  console.log("Timelock roles configured");

  // 6. Deploy Bridge Components (MVP)
  console.log("\n6. Deploying Bridge components...");
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  // 6a. Deploy Wrapped Asset721 (on destination chains)
  // For MVP/testing we deploy on current network as well
  const WrappedAsset721 = await ethers.getContractFactory("WrappedAsset721");
  const wrapped721 = await upgrades.deployProxy(WrappedAsset721, [
    "Assetra Wrapped RWA",
    "wARWA",
  ], {
    initializer: "initialize",
    kind: "uups",
  });
  await wrapped721.waitForDeployment();
  const wrapped721Addr = await wrapped721.getAddress();
  console.log("WrappedAsset721 deployed to:", wrapped721Addr);

  // 6b. Deploy AssetBridgeSource (locks ERC721 on source)
  const windowSeconds = 3600; // 1 hour
  const maxPerWindow = 10;    // 10 NFTs per hour per address
  const AssetBridgeSource = await ethers.getContractFactory("AssetBridgeSource");
  const bridgeSource = await upgrades.deployProxy(AssetBridgeSource, [
    chainId,
    windowSeconds,
    maxPerWindow,
  ], {
    initializer: "initialize",
    kind: "uups",
  });
  await bridgeSource.waitForDeployment();
  const bridgeSourceAddr = await bridgeSource.getAddress();
  console.log("AssetBridgeSource deployed to:", bridgeSourceAddr);

  // 6c. Deploy AssetBridgeDestination (mints wrapped on destination)
  const requiredApprovals = 2; // Relayer quorum
  const AssetBridgeDestination = await ethers.getContractFactory("AssetBridgeDestination");
  const bridgeDestination = await upgrades.deployProxy(AssetBridgeDestination, [
    chainId,
    wrapped721Addr,
    requiredApprovals,
  ], {
    initializer: "initialize",
    kind: "uups",
  });
  await bridgeDestination.waitForDeployment();
  const bridgeDestinationAddr = await bridgeDestination.getAddress();
  console.log("AssetBridgeDestination deployed to:", bridgeDestinationAddr);

  // Wire roles: destination must be able to mint wrapped; grant deployer a RELAYER_ROLE for testing
  const MINTER_ROLE = await wrapped721.MINTER_ROLE();
  await (await wrapped721.grantRole(MINTER_ROLE, bridgeDestinationAddr)).wait();
  console.log("Granted MINTER_ROLE on WrappedAsset721 to AssetBridgeDestination");

  const RELAYER_ROLE = await bridgeDestination.RELAYER_ROLE();
  await (await bridgeDestination.grantRole(RELAYER_ROLE, deployer.address)).wait();
  console.log("Granted RELAYER_ROLE on AssetBridgeDestination to deployer (testing)");

  // 7. Deploy Staking Vault (MVP: stake FractionalShare and earn FractionalShare)
  console.log("\n7. Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const defaultRewardRate = parseUnits("1", 18) // 1 token/sec for demo; adjust in prod
  const stakingVault = await upgrades.deployProxy(
    StakingVault,
    [
      fractionalShareAddr, // staking token
      fractionalShareAddr, // reward token (MVP)
      defaultRewardRate,
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );
  await stakingVault.waitForDeployment();
  const stakingVaultAddr = await stakingVault.getAddress();
  console.log("StakingVault deployed to:", stakingVaultAddr);

  console.log("\n=== Deployment Complete ===");
  console.log("KYC Registry:", kycRegistryAddr);
  console.log("Asset NFT:", assetNFTAddr);
  console.log("Fractional Share:", fractionalShareAddr);
  console.log("Timelock:", timelockAddr);
  console.log("Governance:", governanceAddr);
  console.log("WrappedAsset721:", wrapped721Addr);
  console.log("BridgeSource:", bridgeSourceAddr);
  console.log("BridgeDestination:", bridgeDestinationAddr);
  console.log("StakingVault:", stakingVaultAddr);

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      kycRegistry: kycRegistryAddr,
      assetNFT: assetNFTAddr,
      fractionalShare: fractionalShareAddr,
      timelock: timelockAddr,
      governance: governanceAddr,
      wrapped721: wrapped721Addr,
      bridgeSource: bridgeSourceAddr,
      bridgeDestination: bridgeDestinationAddr,
      stakingVault: stakingVaultAddr,
    },
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
