import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { setupTest, TestSigners, TestContracts } from '../utils/fixtures';

describe('FractionalShare', () => {
  let contracts: TestContracts;
  let signers: TestSigners;

  before(async () => {
    const testSetup = await loadFixture(setupTest);
    contracts = testSetup.contracts;
    signers = testSetup.signers;
  });

  describe('Deployment', () => {
    it('should deploy with correct initial state', async () => {
      const { fractionalShare } = contracts;
      expect(await fractionalShare.name()).to.equal('FractionalShare');
      expect(await fractionalShare.symbol()).to.equal('FRAC');
      expect(await fractionalShare.hasRole(await fractionalShare.DEFAULT_ADMIN_ROLE(), signers.admin.address)).to.be.true;
    });
  });

  describe('Token Operations', () => {
    const tokenId = 1;
    const amount = ethers.parseEther('1000');
    
    beforeEach(async () => {
      // Mint an NFT and fractional shares for testing
      await contracts.assetNFT.connect(signers.admin).mint(signers.user1.address, tokenId, 'ipfs://test-uri');
      await contracts.fractionalShare.connect(signers.admin).mint(signers.user1.address, tokenId, amount);
    });

    it('should allow minting fractional shares', async () => {
      const { fractionalShare } = contracts;
      const newAmount = ethers.parseEther('500');
      
      await expect(
        fractionalShare.connect(signers.admin).mint(signers.user2.address, tokenId, newAmount)
      ).to.emit(fractionalShare, 'TransferSingle')
       .withArgs(
         signers.admin.address,
         ethers.ZeroAddress,
         signers.user2.address,
         tokenId,
         newAmount
       );
      
      expect(await fractionalShare.balanceOf(signers.user2.address, tokenId)).to.equal(newAmount);
    });

    it('should allow transferring fractional shares', async () => {
      const { fractionalShare } = contracts;
      const transferAmount = ethers.parseEther('100');
      
      await expect(
        fractionalShare.connect(signers.user1)
          .safeTransferFrom(
            signers.user1.address,
            signers.user2.address,
            tokenId,
            transferAmount,
            '0x'
          )
      ).to.emit(fractionalShare, 'TransferSingle')
       .withArgs(
         signers.user1.address,
         signers.user1.address,
         signers.user2.address,
         tokenId,
         transferAmount
       );
      
      expect(await fractionalShare.balanceOf(signers.user1.address, tokenId)).to.equal(ethers.parseEther('900'));
      expect(await fractionalShare.balanceOf(signers.user2.address, tokenId)).to.equal(transferAmount);
    });

    it('should not allow transferring more than balance', async () => {
      const { fractionalShare } = contracts;
      const transferAmount = ethers.parseEther('2000'); // More than minted
      
      await expect(
        fractionalShare.connect(signers.user1)
          .safeTransferFrom(
            signers.user1.address,
            signers.user2.address,
            tokenId,
            transferAmount,
            '0x'
          )
      ).to.be.revertedWith('ERC1155: insufficient balance for transfer');
    });
  });

  describe('Governance', () => {
    it('should allow admin to pause and unpause', async () => {
      const { fractionalShare } = contracts;
      const PAUSER_ROLE = await fractionalShare.PAUSER_ROLE();
      
      // Grant pauser role to admin if not already granted
      if (!(await fractionalShare.hasRole(PAUSER_ROLE, signers.admin.address))) {
        await fractionalShare.grantRole(PAUSER_ROLE, signers.admin.address);
      }
      
      // Test pausing
      await expect(fractionalShare.connect(signers.admin).pause())
        .to.emit(fractionalShare, 'Paused')
        .withArgs(signers.admin.address);
      
      // Test unpausing
      await expect(fractionalShare.connect(signers.admin).unpause())
        .to.emit(fractionalShare, 'Unpaused')
        .withArgs(signers.admin.address);
    });
  });

  describe('URI', () => {
    it('should return the correct token URI', async () => {
      const { fractionalShare } = contracts;
      const baseURI = 'https://api.assetra.xyz/metadata/';
      
      // Set base URI
      await fractionalShare.connect(signers.admin).setURI(baseURI);
      
      // Check URI for token
      expect(await fractionalShare.uri(1)).to.equal(`${baseURI}1`);
    });
  });
});
