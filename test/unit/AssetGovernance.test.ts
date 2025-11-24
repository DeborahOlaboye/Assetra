import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { setupTest, TestSigners, TestContracts } from '../utils/fixtures';

describe('AssetGovernance', () => {
  let contracts: TestContracts;
  let signers: TestSigners;
  
  const tokenId = 1;
  const tokenURI = 'ipfs://test-uri';
  const initialSupply = ethers.parseEther('1000');
  const votingDelay = 1; // 1 block
  const votingPeriod = 5; // 5 blocks
  const proposalThreshold = ethers.parseEther('10');
  const quorumNumerator = 4; // 4%
  
  before(async () => {
    const testSetup = await loadFixture(setupTest);
    contracts = testSetup.contracts;
    signers = testSetup.signers;
    
    // Setup governance parameters
    await contracts.assetGovernance.connect(signers.admin).setVotingDelay(votingDelay);
    await contracts.assetGovernance.connect(signers.admin).setVotingPeriod(votingPeriod);
    await contracts.assetGovernance.connect(signers.admin).setProposalThreshold(proposalThreshold);
    await contracts.assetGovernance.connect(signers.admin).updateQuorumNumerator(quorumNumerator);
    
    // Mint an NFT and fractional shares for testing
    await contracts.assetNFT.connect(signers.admin).mint(signers.user1.address, tokenId, tokenURI);
    await contracts.fractionalShare.connect(signers.admin).mint(signers.user1.address, tokenId, initialSupply);
  });

  describe('Deployment', () => {
    it('should deploy with correct initial state', async () => {
      const { assetGovernance } = contracts;
      
      expect(await assetGovernance.name()).to.equal('AssetGovernance');
      expect(await assetGovernance.token()).to.equal(await contracts.fractionalShare.getAddress());
      expect(await assetGovernance.assetNFT()).to.equal(await contracts.assetNFT.getAddress());
      expect(await assetGovernance.kycRegistry()).to.equal(await contracts.kycRegistry.getAddress());
    });
  });

  describe('Proposal Creation', () => {
    it('should allow token holders to create proposals', async () => {
      const { assetGovernance, fractionalShare } = contracts;
      
      // Delegate voting power to self
      await fractionalShare.connect(signers.user1).delegate(signers.user1.address);
      
      // Create a proposal
      const targets = [signers.user2.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(''))];
      const description = 'Test Proposal';
      
      await expect(
        assetGovernance.connect(signers.user1).propose(
          targets,
          values,
          calldatas,
          description
        )
      ).to.emit(assetGovernance, 'ProposalCreated');
    });

    it('should not allow creating proposals without sufficient voting power', async () => {
      const { assetGovernance } = contracts;
      
      const targets = [signers.user2.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(''))];
      const description = 'Should Fail Proposal';
      
      await expect(
        assetGovernance.connect(signers.user2).propose(
          targets,
          values,
          calldatas,
          description
        )
      ).to.be.revertedWith('Governor: proposer votes below proposal threshold');
    });
  });

  describe('Voting', () => {
    let proposalId: string;
    
    beforeEach(async () => {
      const { assetGovernance, fractionalShare } = contracts;
      
      // Delegate voting power
      await fractionalShare.connect(signers.user1).delegate(signers.user1.address);
      
      // Create a proposal
      const targets = [signers.user2.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(''))];
      const description = 'Voting Test Proposal';
      
      const tx = await assetGovernance.connect(signers.user1).propose(
        targets,
        values,
        calldatas,
        description
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => log.fragment?.name === 'ProposalCreated');
      proposalId = event?.args?.proposalId;
      
      // Move past voting delay
      await ethers.provider.send('evm_mine', []);
    });
    
    it('should allow token holders to vote on proposals', async () => {
      const { assetGovernance } = contracts;
      
      // Vote in favor
      await expect(
        assetGovernance.connect(signers.user1).castVote(proposalId, 1) // 1 = For
      ).to.emit(assetGovernance, 'VoteCast');
      
      // Check vote was recorded
      const vote = await assetGovernance.getVotes(signers.user1.address, proposalId);
      expect(vote).to.be.true;
    });
    
    it('should not allow voting after voting period ends', async () => {
      const { assetGovernance } = contracts;
      
      // Move past voting period
      for (let i = 0; i < votingPeriod + 1; i++) {
        await ethers.provider.send('evm_mine', []);
      }
      
      // Try to vote (should fail)
      await expect(
        assetGovernance.connect(signers.user1).castVote(proposalId, 1)
      ).to.be.revertedWith('Governor: vote not currently active');
    });
  });

  describe('Proposal Execution', () => {
    let proposalId: string;
    
    beforeEach(async () => {
      const { assetGovernance, fractionalShare } = contracts;
      
      // Delegate voting power
      await fractionalShare.connect(signers.user1).delegate(signers.user1.address);
      
      // Create a proposal to transfer ownership of the NFT
      const targets = [await contracts.assetNFT.getAddress()];
      const values = [0];
      const transferCalldata = contracts.assetNFT.interface.encodeFunctionData(
        'transferFrom',
        [signers.user1.address, signers.user2.address, tokenId]
      );
      const calldatas = [transferCalldata];
      const description = 'Transfer NFT Ownership';
      
      const tx = await assetGovernance.connect(signers.user1).propose(
        targets,
        values,
        calldatas,
        description
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => log.fragment?.name === 'ProposalCreated');
      proposalId = event?.args?.proposalId;
      
      // Move past voting delay and vote
      await ethers.provider.send('evm_mine', []);
      await assetGovernance.connect(signers.user1).castVote(proposalId, 1); // Vote in favor
      
      // Move past voting period
      for (let i = 0; i < votingPeriod; i++) {
        await ethers.provider.send('evm_mine', []);
      }
    });
    
    it('should execute successful proposals', async () => {
      const { assetGovernance, assetNFT } = contracts;
      
      // Queue the proposal
      const descriptionHash = ethers.id('Transfer NFT Ownership');
      await assetGovernance.queue(
        [await assetNFT.getAddress()],
        [0],
        [assetNFT.interface.encodeFunctionData('transferFrom', [signers.user1.address, signers.user2.address, tokenId])],
        descriptionHash
      );
      
      // Fast forward time
      await ethers.provider.send('evm_increaseTime', [86400]); // 1 day in seconds
      await ethers.provider.send('evm_mine', []);
      
      // Execute the proposal
      await expect(
        assetGovernance.execute(
          [await assetNFT.getAddress()],
          [0],
          [assetNFT.interface.encodeFunctionData('transferFrom', [signers.user1.address, signers.user2.address, tokenId])],
          descriptionHash
        )
      ).to.emit(assetNFT, 'Transfer')
       .withArgs(signers.user1.address, signers.user2.address, tokenId);
      
      // Verify NFT was transferred
      expect(await assetNFT.ownerOf(tokenId)).to.equal(signers.user2.address);
    });
  });

  describe('Access Control', () => {
    it('should allow admin to update parameters', async () => {
      const { assetGovernance } = contracts;
      const newVotingPeriod = 10;
      
      await expect(
        assetGovernance.connect(signers.admin).setVotingPeriod(newVotingPeriod)
      ).to.emit(assetGovernance, 'VotingPeriodSet')
       .withArgs(votingPeriod, newVotingPeriod);
      
      expect(await assetGovernance.votingPeriod()).to.equal(newVotingPeriod);
    });
    
    it('should not allow non-admin to update parameters', async () => {
      const { assetGovernance } = contracts;
      
      await expect(
        assetGovernance.connect(signers.user1).setVotingPeriod(10)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
