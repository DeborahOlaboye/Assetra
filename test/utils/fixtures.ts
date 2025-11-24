import { ethers, upgrades } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { 
  AssetNFT,
  AssetNFT__factory,
  FractionalShare,
  FractionalShare__factory,
  KYCRegistry,
  KYCRegistry__factory,
  AssetGovernance,
  AssetGovernance__factory
} from '../../typechain-types';

export interface TestSigners {
  deployer: SignerWithAddress;
  admin: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  user3: SignerWithAddress;
  users: SignerWithAddress[];
}

export interface TestContracts {
  assetNFT: AssetNFT;
  fractionalShare: FractionalShare;
  kycRegistry: KYCRegistry;
  assetGovernance: AssetGovernance;
}

export const getSigners = async (): Promise<TestSigners> => {
  const [deployer, admin, user1, user2, user3, ...users] = await ethers.getSigners();
  return { deployer, admin, user1, user2, user3, users };
};

export const deployContracts = async (admin: string): Promise<TestContracts> => {
  // Deploy KYC Registry
  const KYCRegistry = await ethers.getContractFactory('KYCRegistry');
  const kycRegistry = await upgrades.deployProxy(KYCRegistry, [admin], {
    initializer: 'initialize',
  }) as unknown as KYCRegistry;
  await kycRegistry.waitForDeployment();

  // Deploy AssetNFT
  const AssetNFT = await ethers.getContractFactory('AssetNFT');
  const assetNFT = await upgrades.deployProxy(AssetNFT, [admin], {
    initializer: 'initialize',
  }) as unknown as AssetNFT;
  await assetNFT.waitForDeployment();

  // Deploy FractionalShare
  const FractionalShare = await ethers.getContractFactory('FractionalShare');
  const fractionalShare = await upgrades.deployProxy(FractionalShare, [admin], {
    initializer: 'initialize',
  }) as unknown as FractionalShare;
  await fractionalShare.waitForDeployment();

  // Deploy AssetGovernance
  const AssetGovernance = await ethers.getContractFactory('AssetGovernance');
  const assetGovernance = await upgrades.deployProxy(AssetGovernance, [
    admin,
    await assetNFT.getAddress(),
    await fractionalShare.getAddress(),
    await kycRegistry.getAddress()
  ], {
    initializer: 'initialize',
  }) as unknown as AssetGovernance;
  await assetGovernance.waitForDeployment();

  return {
    assetNFT,
    fractionalShare,
    kycRegistry,
    assetGovernance,
  };
};

export const setupTest = async (): Promise<{
  contracts: TestContracts;
  signers: TestSigners;
}> => {
  const signers = await getSigners();
  const contracts = await deployContracts(signers.admin.address);
  return { contracts, signers };
};
