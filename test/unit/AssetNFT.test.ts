import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { setupTest, TestSigners, TestContracts } from '../utils/fixtures';

describe('AssetNFT', () => {
  let contracts: TestContracts;
  let signers: TestSigners;

  before(async () => {
    const testSetup = await loadFixture(setupTest);
    contracts = testSetup.contracts;
    signers = testSetup.signers;
  });

  describe('Deployment', () => {
    it('should deploy with correct initial state', async () => {
      const { assetNFT } = contracts;
      expect(await assetNFT.name()).to.equal('AssetNFT');
      expect(await assetNFT.symbol()).to.equal('ASST');
      expect(await assetNFT.hasRole(await assetNFT.DEFAULT_ADMIN_ROLE(), signers.admin.address)).to.be.true;
    });
  });

  describe('Minting', () => {
    it('should allow admin to mint new tokens', async () => {
      const { assetNFT } = contracts;
      const tokenId = 1;
      const tokenURI = 'ipfs://test-uri';
      
      await expect(assetNFT.connect(signers.admin).mint(signers.user1.address, tokenId, tokenURI))
        .to.emit(assetNFT, 'Transfer')
        .withArgs(ethers.ZeroAddress, signers.user1.address, tokenId);
      
      expect(await assetNFT.ownerOf(tokenId)).to.equal(signers.user1.address);
      expect(await assetNFT.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it('should not allow non-admin to mint tokens', async () => {
      const { assetNFT } = contracts;
      await expect(
        assetNFT.connect(signers.user1).mint(signers.user1.address, 2, 'ipfs://test-uri-2')
      ).to.be.revertedWith('AccessControl:');
    });
  });

  describe('Token URI', () => {
    it('should return the correct token URI', async () => {
      const { assetNFT } = contracts;
      const tokenId = 3;
      const tokenURI = 'ipfs://test-uri-3';
      
      await assetNFT.connect(signers.admin).mint(signers.user1.address, tokenId, tokenURI);
      expect(await assetNFT.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it('should revert for non-existent token', async () => {
      const { assetNFT } = contracts;
      await expect(assetNFT.tokenURI(999)).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('Access Control', () => {
    it('should allow admin to grant roles', async () => {
      const { assetNFT } = contracts;
      const MINTER_ROLE = await assetNFT.MINTER_ROLE();
      
      await expect(
        assetNFT.connect(signers.admin).grantRole(MINTER_ROLE, signers.user2.address)
      ).to.emit(assetNFT, 'RoleGranted')
       .withArgs(MINTER_ROLE, signers.user2.address, signers.admin.address);
    });

    it('should allow users with minter role to mint', async () => {
      const { assetNFT } = contracts;
      const MINTER_ROLE = await assetNFT.MINTER_ROLE();
      
      // Grant minter role to user2
      await assetNFT.connect(signers.admin).grantRole(MINTER_ROLE, signers.user2.address);
      
      // User2 should now be able to mint
      await expect(
        assetNFT.connect(signers.user2).mint(signers.user2.address, 10, 'ipfs://minter-uri')
      ).to.emit(assetNFT, 'Transfer');
      
      expect(await assetNFT.ownerOf(10)).to.equal(signers.user2.address);
    });
  });

  describe('Upgrades', () => {
    it('should be upgradeable', async () => {
      const { assetNFT } = contracts;
      const AssetNFTV2 = await ethers.getContractFactory('AssetNFT');
      
      // Deploy new implementation
      const assetNFTV2 = await upgrades.upgradeProxy(
        await assetNFT.getAddress(),
        AssetNFTV2
      );
      
      // Verify the contract is upgraded
      const version = await assetNFTV2.version();
      expect(version).to.equal('2.0.0'); // Make sure to add a version() function in V2
    });
  });
});
