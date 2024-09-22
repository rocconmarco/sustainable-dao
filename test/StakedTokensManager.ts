import { expect } from "chai";
import { ethers } from "hardhat";

describe("StakedTokensManager contract", () => {
  it("Should register a voter in the s_userWithStakedTokens array", async function () {
    const [owner, user1, user2] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()])
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(), stakedTokensManager.getAddress()
    ]);

    const valueTransferred = 2_000_000;
    await governanceToken.transfer(user1.address, valueTransferred);
    await governanceToken.transfer(user2.address, valueTransferred);

    await governanceToken.connect(user1).approve(sustainableDao.getAddress(), valueTransferred);
    await governanceToken.connect(user2).approve(sustainableDao.getAddress(), valueTransferred);

    const proposalDescription = "This is my proposal.";
    await sustainableDao.connect(user1).createProposal(proposalDescription);

    await sustainableDao.connect(user1).voteOnProposal(0, true);
    const userBalanceAfterVoting = await governanceToken.balanceOf(user1);
    console.log("User Balance after Voting: ", userBalanceAfterVoting)

    expect(await governanceToken.balanceOf(user1)).to.equal(0);
    expect(await stakedTokensManager.getUserStakedTokens(user1)).to.equal(valueTransferred);
  });
});
