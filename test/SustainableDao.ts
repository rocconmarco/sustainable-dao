import { expect } from "chai";
import { ethers, network } from "hardhat";
import { erc20 } from "../typechain-types/factories/@openzeppelin/contracts/token";

describe("SustainableDao contract", async function () {
  it("Should not allow non-members to create a proposal", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    await expect(
      sustainableDao.connect(user).createProposal("I want to propose something.")
    ).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__NoAvailableTokens");
  });

  it("Should add the proposal to the s_proposals array", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = ethers.parseUnits("1");
    await governanceToken.transfer(user.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user).createProposal(proposalDescription);

    expect((await sustainableDao.getSpecificProposal(0)).description).to.equal(proposalDescription);
  });

  it("Should revert with custom error SustainableDao__DescriptionCannotBeEmpty", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = ethers.parseUnits("1");
    await governanceToken.transfer(user.address, valueTransferred);

    const proposalDescription = "";
    await expect(sustainableDao.connect(user).createProposal(proposalDescription)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__DescriptionCannotBeEmpty"
    );
  });

  it("Should get the list of all proposals", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = ethers.parseUnits("100");
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    const proposalDescriptionUser1 = "This is the proposal from User1";
    await sustainableDao.connect(user1).createProposal(proposalDescriptionUser1);

    const proposalDescriptionUser2 = "This is the proposal from User2";
    await sustainableDao.connect(user2).createProposal(proposalDescriptionUser2);

    expect((await sustainableDao.getListOfAllProposals()).length).to.equal(2);
  });

  it("Should allow the user to approve its tokens to the SustainableDao contract", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSent = ethers.parseEther("1");

    await sustainableDao.connect(user1).buyTokens({ value: etherSent });
    const userBalance = await governanceToken.balanceOf(user1.address);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), userBalance);

    expect(await governanceToken.allowance(user1.address, sustainableDao.getAddress())).to.equal(userBalance);
  });

  it("Should allow the user to vote for a proposal", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    const user1BalanceBeforeVoting = await governanceToken.balanceOf(user1.address);
    const user2BalanceBeforeVoting = await governanceToken.balanceOf(user2.address);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), user1BalanceBeforeVoting);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), user2BalanceBeforeVoting);

    await sustainableDao.connect(user1).voteOnProposal(0, true);
    await sustainableDao.connect(user2).voteOnProposal(0, false);

    expect(await sustainableDao.getProposalVotes(0)).to.equal(user1BalanceBeforeVoting + user2BalanceBeforeVoting);
  });

  it("Should revert with custom error ERC20InsufficientAllowance", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = ethers.parseUnits("1");
    await governanceToken.transfer(user1.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await expect(sustainableDao.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(
      governanceToken,
      "ERC20InsufficientAllowance"
    );
  });

  it("Should not allow the user to vote twice", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    const user1BalanceBeforeVoting = await governanceToken.balanceOf(user1.address);
    const user2BalanceBeforeVoting = await governanceToken.balanceOf(user2.address);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), user1BalanceBeforeVoting);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), user2BalanceBeforeVoting);

    await sustainableDao.connect(user1).voteOnProposal(0, true);
    await sustainableDao.connect(user2).voteOnProposal(0, true);

    await expect(sustainableDao.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NoAvailableTokens"
    );
  });

  it("Should not allow the user to vote twice after buying other tokens", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSent = ethers.parseEther("1");
    await sustainableDao.connect(user1).buyTokens({ value: etherSent });

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    const user1BalanceBeforeVoting = await governanceToken.balanceOf(user1.address);
    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), user1BalanceBeforeVoting);

    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await sustainableDao.connect(user1).buyTokens({ value: etherSent });
    const user1BalanceAfterSecondPurchasing = await governanceToken.balanceOf(user1.address);
    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), user1BalanceAfterSecondPurchasing);

    await expect(sustainableDao.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__AlreadyVoted");
  });

  it("Should not allow the user to vote after the end of voting", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSent = ethers.parseEther("1");
    await sustainableDao.connect(user1).buyTokens({ value: etherSent });

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    const proposalEndVotingTimestamp = (await sustainableDao.getSpecificProposal(0)).endVotingTimestamp;

    await network.provider.send("evm_increaseTime", [proposalEndVotingTimestamp.toString() + "1"]);
    await network.provider.send("evm_mine");

    await expect(sustainableDao.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__VotingClosed");
  })

  it("Should register the delegants as voters", async function () {
    const [owner, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);
    await governanceToken.transfer(user4.address, valueTransferred);
    await governanceToken.transfer(user5.address, valueTransferred);
    await governanceToken.transfer(user6.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user3).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user4).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user5).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user6).approve(sustainableDao.getAddress(), valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await sustainableDao.connect(user4).delegateVote(user6.address);
    await sustainableDao.connect(user5).delegateVote(user6.address);

    await sustainableDao.connect(user3).voteAsADelegate(0, true);
    await sustainableDao.connect(user6).voteAsADelegate(0, false);

    expect(await sustainableDao.getHasVoted(user1, 0)).to.equal(true);
    expect(await sustainableDao.getHasVoted(user2, 0)).to.equal(true);
    expect(await sustainableDao.getHasVoted(user4, 0)).to.equal(true);
    expect(await sustainableDao.getHasVoted(user5, 0)).to.equal(true);
  });

  it("Should not allow the delegate to vote twice", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user3).approve(sustainableDao.getAddress(), valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await sustainableDao.connect(user3).voteAsADelegate(0, true);
    await expect(sustainableDao.connect(user3).voteAsADelegate(0, true)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NoAvailableTokens"
    );
  });

  it("Should not allow non-delegates to vote as delegate", async function () {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);
    await governanceToken.transfer(user4.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user3).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user4).approve(sustainableDao.getAddress(), valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await expect(sustainableDao.connect(user4).voteAsADelegate(0, true)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotADelegate"
    );
  });

  it("Delegants should not be able to vote", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user3).approve(sustainableDao.getAddress(), valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await expect(sustainableDao.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NoAvailableTokens"
    );
  });

  it("The user should purchase the right amount of governance token", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSent = ethers.parseEther("1");
    const expectedTokens = ethers.parseUnits("100");

    await sustainableDao.connect(user1).buyTokens({ value: etherSent });

    const userTokenAmountAfterPurchase = await governanceToken.balanceOf(user1.address);
    const contractTokenAmountAfterPurchase = await governanceToken.balanceOf(sustainableDao.getAddress());

    expect(userTokenAmountAfterPurchase).to.equal(expectedTokens);
  });

  it("Multiple users should purchase the right amount of governance token", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSentUser1 = ethers.parseEther("1");
    const etherSentUser2 = ethers.parseEther("2");
    const etherSentUser3 = ethers.parseEther("0.6");
    const expectedTokensUser1 = ethers.parseUnits("100");
    const expectedTokensUser2 = ethers.parseUnits("200");
    const expectedTokensUser3 = ethers.parseUnits("60");

    await sustainableDao.connect(user1).buyTokens({ value: etherSentUser1 });
    await sustainableDao.connect(user2).buyTokens({ value: etherSentUser2 });
    await sustainableDao.connect(user3).buyTokens({ value: etherSentUser3 });

    const user1TokenAmountAfterPurchase = await governanceToken.balanceOf(user1.address);
    const user2TokenAmountAfterPurchase = await governanceToken.balanceOf(user2.address);
    const user3TokenAmountAfterPurchase = await governanceToken.balanceOf(user3.address);
    const contractTokenAmountAfterPurchase = await governanceToken.balanceOf(sustainableDao.getAddress());

    expect(user1TokenAmountAfterPurchase).to.equal(expectedTokensUser1);
    expect(user2TokenAmountAfterPurchase).to.equal(expectedTokensUser2);
    expect(user3TokenAmountAfterPurchase).to.equal(expectedTokensUser3);
  });

  it("Should revert with custom error SustainableDao__SendEtherToPurchaseTokens", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount);

    const etherSent = ethers.parseUnits("0");

    await expect(sustainableDao.connect(user1).buyTokens({ value: etherSent })).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__SendEtherToPurchaseTokens"
    );
  });

  it("Should revert with custom error SustainableDao__NotEnoughTokensInTheContract", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const etherSent = ethers.parseEther("1");
    const expectedTokens = ethers.parseUnits("100");

    await expect(sustainableDao.connect(user1).buyTokens({ value: etherSent })).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotEnoughTokensInTheContract"
    );
  });

  it("Owner should be able to change the token price", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const newTokenPrice = ethers.parseUnits("0.02");
    await sustainableDao.connect(owner).setTokenPrice(newTokenPrice);

    expect(await sustainableDao.getTokenPrice()).to.equal(newTokenPrice);
  });

  it("Only the owner should be able to change the token price", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const newTokenPrice = ethers.parseUnits("0.02");
    await expect(sustainableDao.connect(user1).setTokenPrice(newTokenPrice)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotOwner"
    );
  });

  it("Owner should be able to close the sale of tokens", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const saleOpen = await sustainableDao.getSaleOpen();

    await sustainableDao.closeSale();

    const saleOpenAfterClosing = await sustainableDao.getSaleOpen();

    expect(saleOpenAfterClosing).to.equal(false);
  });

  it("Should not allow to purchase token when sale closed", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    await sustainableDao.closeSale();

    const etherSent = ethers.parseEther("1");
    await expect(sustainableDao.connect(user1).buyTokens({ value: etherSent })).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__SaleClosed"
    );
  });

  it("Should execute a successful proposal after the timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred)

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1]);
    await network.provider.send("evm_mine");

    await sustainableDao.connect(owner).executeProposal(0);

    expect((await sustainableDao.getSpecificProposal(0)).executed).to.equal(true);
  });

  it("Should not allow to execute a proposal ahead of timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred)

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__VotingStillInProgress"
    );
  });

  it("Should not allow to execute a proposal that did not pass", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred)

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, false);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1]);
    await network.provider.send("evm_mine");

    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__ProposalDidNotPass"
    );
  });

  it("Should not allow non-owners to execute a proposal", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred)

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await expect(sustainableDao.connect(user1).executeProposal(0)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotOwner"
    );
  });

  it("Should not allow to execute a proposal twice", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred)

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1]);
    await network.provider.send("evm_mine");

    await sustainableDao.connect(owner).executeProposal(0);
    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__ProposalAlreadyExecuted"
    );
  });

  it("Should allow the owner to change the timelock duration", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const newTimelockDuration = 5;
    const secondsInOneDay = 86400;

    await sustainableDao.connect(owner).setTimelockDuration(newTimelockDuration);
    expect(await sustainableDao.getTimelockDuration()).to.equal(newTimelockDuration * secondsInOneDay);
  });

  it("Should not allow non-owners to change the timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [initialSupply]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
      stakedTokensManager.getAddress(),
    ]);

    const newTimelockDuration = 5;

    await expect(sustainableDao.connect(user1).setTimelockDuration(newTimelockDuration)).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotOwner"
    );
  });
});
