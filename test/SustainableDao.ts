import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("SustainableDao contract", async function () {
  it("Should revert with SustainableDao__NotAMember", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    await expect(
      sustainableDao
        .connect(user)
        .createProposal("I want to propose something.")
    ).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotAMember"
    );
  });

  it("Should add the proposal to the s_proposals array", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = initialSupply;
    await governanceToken.transfer(user.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user).createProposal(proposalDescription);

    expect((await sustainableDao.getSpecificProposal(0)).description).to.equal(
      proposalDescription
    );
  });

  it("Should revert with custom error SustainableDao__DescriptionCannotBeEmpty", async function () {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = initialSupply;
    await governanceToken.transfer(user.address, valueTransferred);

    const proposalDescription = "";
    await expect(sustainableDao.connect(user).createProposal(proposalDescription)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__DescriptionCannotBeEmpty")
  });

  it("Should get the list of all proposals", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = ethers.parseUnits("100");
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    const proposalDescriptionUser1 = "This is the proposal from User1";
    await sustainableDao.connect(user1).createProposal(proposalDescriptionUser1);

    const proposalDescriptionUser2 = "This is the proposal from User2";
    await sustainableDao.connect(user2).createProposal(proposalDescriptionUser2);

    expect(((await sustainableDao.getListOfAllProposals()).length)).to.equal(2);
    // console.log("List of all proposals: ", await sustainableDao.getListOfAllProposals())
  });

  it("Should allow the user to vote for a proposal", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    /* console.log(
      "User1 total balance: ",
      await governanceToken.balanceOf(user1.address)
    );
    console.log(
      "User2 total balance: ",
      await governanceToken.balanceOf(user2.address)
    ); */

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).voteOnProposal(0, true);
    await sustainableDao.connect(user2).voteOnProposal(0, false);

    /* console.log("Proposal[0]: ", await sustainableDao.getSpecificProposal(0));
    console.log(
      "Proposal[0] total votes: ",
      await sustainableDao.getProposalVotes(0)
    ); */
  });

  it("Should revert with SustainableDao__AlreadyVoted", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    /* console.log(
      "User1 total balance: ",
      await governanceToken.balanceOf(user1.address)
    );
    console.log(
      "User2 total balance: ",
      await governanceToken.balanceOf(user2.address)
    ); */

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).voteOnProposal(0, true);
    await sustainableDao.connect(user2).voteOnProposal(0, true);

    /* console.log(
      "Percentage of vote for: ",
      await sustainableDao.getProposalVoteForPercentage(0)
    ); */

    await expect(
      sustainableDao.connect(user1).voteOnProposal(0, true)
    ).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__AlreadyVoted"
    );
  });

  it("Should register the delegants as voters", async function () {
    const [owner, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);
    await governanceToken.transfer(user4.address, valueTransferred);
    await governanceToken.transfer(user5.address, valueTransferred);
    await governanceToken.transfer(user6.address, valueTransferred);

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

    /* console.log("Proposal[0]", await sustainableDao.getSpecificProposal(0));
    console.log(
      "Percentage of vote for: ",
      await sustainableDao.getProposalVoteForPercentage(0)
    ); */
  });

  it("Should not allow the delegate to vote twice", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);

    /* console.log(
      "User1 total balance: ",
      await governanceToken.balanceOf(user1.address)
    );
    console.log(
      "User2 total balance: ",
      await governanceToken.balanceOf(user2.address)
    );
    console.log(
      "User3 total balance: ",
      await governanceToken.balanceOf(user3.address)
    ); */

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await sustainableDao.connect(user3).voteAsADelegate(0, true);
    await expect(sustainableDao.connect(user3).voteAsADelegate(0, true)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__AlreadyVoted");
  });

  it("Should not allow non-delegates to vote as delegate", async function () {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);
    await governanceToken.transfer(user4.address, valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await expect(sustainableDao.connect(user4).voteAsADelegate(0, true)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__NotADelegate");
  });

  it("Delegants should not be able to vote", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);
    await governanceToken.transfer(user3.address, valueTransferred);

    /* console.log(
      "User1 total balance: ",
      await governanceToken.balanceOf(user1.address)
    );
    console.log(
      "User2 total balance: ",
      await governanceToken.balanceOf(user2.address)
    );
    console.log(
      "User3 total balance: ",
      await governanceToken.balanceOf(user3.address)
    ); */

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).delegateVote(user3.address);
    await sustainableDao.connect(user2).delegateVote(user3.address);

    await expect(
      sustainableDao.connect(user1).voteOnProposal(0, true)
    ).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__UserHasDelegatedTheVote"
    );
  });

  it("The user should purchase the right amount of governance token", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(
      sustainableDao.getAddress(),
      fundingAmount
    );

    const etherSent = ethers.parseEther("1");
    const expectedTokens = ethers.parseUnits("100");

    await sustainableDao.connect(user1).buyTokens({ value: etherSent });

    const userTokenAmountAfterPurchase = await governanceToken.balanceOf(
      user1.address
    );
    const contractTokenAmountAfterPurchase = await governanceToken.balanceOf(sustainableDao.getAddress())

    expect(userTokenAmountAfterPurchase).to.equal(expectedTokens);
    // console.log("User balance of governance token after purchase: ", userTokenAmountAfterPurchase)
    // console.log("SustainableDao contract balance of governance token after purchase: ", contractTokenAmountAfterPurchase)
  });

  it("Multiple users should purchase the right amount of governance token", async function () {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(
      sustainableDao.getAddress(),
      fundingAmount
    );

    const etherSentUser1 = ethers.parseEther("1");
    const etherSentUser2 = ethers.parseEther("2");
    const etherSentUser3 = ethers.parseEther("0.6");
    const expectedTokensUser1 = ethers.parseUnits("100");
    const expectedTokensUser2 = ethers.parseUnits("200");
    const expectedTokensUser3 = ethers.parseUnits("60");

    await sustainableDao.connect(user1).buyTokens({ value: etherSentUser1 });
    await sustainableDao.connect(user2).buyTokens({ value: etherSentUser2 });
    await sustainableDao.connect(user3).buyTokens({ value: etherSentUser3 });

    const user1TokenAmountAfterPurchase = await governanceToken.balanceOf(
      user1.address
    );
    const user2TokenAmountAfterPurchase = await governanceToken.balanceOf(
      user2.address
    );
    const user3TokenAmountAfterPurchase = await governanceToken.balanceOf(
      user3.address
    );
    const contractTokenAmountAfterPurchase = await governanceToken.balanceOf(sustainableDao.getAddress())

    expect(user1TokenAmountAfterPurchase).to.equal(expectedTokensUser1);
    expect(user2TokenAmountAfterPurchase).to.equal(expectedTokensUser2);
    expect(user3TokenAmountAfterPurchase).to.equal(expectedTokensUser3);
    // console.log("User1 balance of governance token after purchase: ", user1TokenAmountAfterPurchase)
    // console.log("User2 balance of governance token after purchase: ", user2TokenAmountAfterPurchase)
    // console.log("User3 balance of governance token after purchase: ", user3TokenAmountAfterPurchase)
    // console.log("SustainableDao contract balance of governance token after purchase: ", contractTokenAmountAfterPurchase)
  });

  it("Should revert with custom error SustainableDao__SendEtherToPurchaseTokens", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const fundingAmount = ethers.parseUnits("500000");
    await governanceToken.fundSustainableDao(
      sustainableDao.getAddress(),
      fundingAmount
    );

    const etherSent = ethers.parseUnits("0");

    await expect(
      sustainableDao.connect(user1).buyTokens({ value: etherSent })
    ).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__SendEtherToPurchaseTokens"
    );
  });

  it("Should revert with custom error SustainableDao__NotEnoughTokensInTheContract", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const etherSent = ethers.parseEther("1");
    const expectedTokens = ethers.parseUnits("100");

    await expect(
      sustainableDao.connect(user1).buyTokens({ value: etherSent })
    ).to.be.revertedWithCustomError(
      sustainableDao,
      "SustainableDao__NotEnoughTokensInTheContract"
    );
  });

  it("Owner should be able to change the token price", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    // console.log("Token price before change : ", await sustainableDao.getTokenPrice())
    const newTokenPrice = ethers.parseUnits("0.02");
    await sustainableDao.connect(owner).setTokenPrice(newTokenPrice);
    // console.log("Token price after change : ", await sustainableDao.getTokenPrice())

    expect(await sustainableDao.getTokenPrice()).to.equal(newTokenPrice);
  });

  it("Only the owner should be able to change the token price", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const newTokenPrice = ethers.parseUnits("0.02");
    await expect(sustainableDao.connect(user1).setTokenPrice(newTokenPrice)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__NotOwner")
  });

  it("Owner should be able to close the sale of tokens", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const saleOpen = await sustainableDao.getSaleOpen()
    // console.log("Sale state before changing: ", saleOpen)

    await sustainableDao.closeSale();

    const saleOpenAfterClosing = await sustainableDao.getSaleOpen()
    // console.log("Sale state before changing: ", saleOpenAfterClosing)

    expect(saleOpenAfterClosing).to.equal(false);
    
  });

  it("Should not allow to purchase token when sale closed", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    await sustainableDao.closeSale();

    const etherSent = ethers.parseEther("1")
    await expect(sustainableDao.connect(user1).buyTokens({ value: etherSent })).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__SaleClosed")
    
  });

  it("Should execute a successful proposal after the timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1])
    await network.provider.send("evm_mine")

    await sustainableDao.connect(owner).executeProposal(0);

    expect((await sustainableDao.getSpecificProposal(0)).executed).to.equal(true);
  });


  it("Should not allow to execute a proposal ahead of timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__VotingStillInProgress")
  });

  it("Should not allow to execute a proposal that did not pass", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, false);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1])
    await network.provider.send("evm_mine")

    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__ProposalDidNotPass")
  });

  it("Should not allow non-owners to execute a proposal", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await expect(sustainableDao.connect(user1).executeProposal(0)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__NotOwner")
  });

  it("Should not allow to execute a proposal twice", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);

    await sustainableDao.createProposal("This is my proposal.");
    await sustainableDao.connect(user1).voteOnProposal(0, true);

    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1])
    await network.provider.send("evm_mine")

    await sustainableDao.connect(owner).executeProposal(0);
    await expect(sustainableDao.connect(owner).executeProposal(0)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__ProposalAlreadyExecuted")
  });

  it("Should allow the owner to change the timelock duration", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const newTimelockDuration = 5;
    const secondsInOneDay = 86400;

    await sustainableDao.connect(owner).setTimelockDuration(newTimelockDuration);
    expect(await sustainableDao.getTimelockDuration()).to.equal(newTimelockDuration * secondsInOneDay)

  });

  it("Should not allow non-owners to change the timelock duration", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(),
    ]);

    const newTimelockDuration = 5;

    await expect(sustainableDao.connect(user1).setTimelockDuration(newTimelockDuration)).to.be.revertedWithCustomError(sustainableDao, "SustainableDao__NotOwner")
  });
});
