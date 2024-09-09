import {expect} from "chai";
import {ethers} from "hardhat"

describe("ProposalSystem contract", async function() {
    it("Should revert with ProposalSystem__NotAMember", async function () {
        const [owner, user] = await ethers.getSigners();
        const reachToken = await ethers.deployContract("ReachToken", [1_000_000]);
        const proposalSystem = await ethers.deployContract("ProposalSystem", [reachToken.getAddress()])

        await expect(proposalSystem.connect(user).createProposal("Voglio proporre qualcosa")).to.be.revertedWithCustomError(proposalSystem, "ProposalSystem__NotAMember")

      });

      it("Should add the proposal to the s_proposals array", async function () {
        const [owner, user] = await ethers.getSigners();
        const reachToken = await ethers.deployContract("ReachToken", [1_000_000]);
        const proposalSystem = await ethers.deployContract("ProposalSystem", [reachToken.getAddress()])

        const valueTransferred = 1_000_000;
        await reachToken.transfer(user.address, valueTransferred);

        const proposalDescription = "Questa è la mia proposta";
        await proposalSystem.connect(user).createProposal(proposalDescription);

        expect((await proposalSystem.getSpecificProposal(0)).description).to.equal(proposalDescription);
      });

      it("Should allow the user to vote for a proposal", async function () {
        const [owner, user1, user2] = await ethers.getSigners();
        const reachToken = await ethers.deployContract("ReachToken", [1_000_000]);
        const proposalSystem = await ethers.deployContract("ProposalSystem", [reachToken.getAddress()])

        const valueTransferred = 2_000_000;
        await reachToken.transfer(user1.address, valueTransferred);
        await reachToken.transfer(user2.address, valueTransferred);

        console.log("User1 total balance: ", await reachToken.balanceOf(user1.address))
        console.log("User2 total balance: ", await reachToken.balanceOf(user2.address))

        const proposalDescription = "Questa è la mia proposta";
        await proposalSystem.connect(user1).createProposal(proposalDescription);

        await proposalSystem.connect(user1).voteOnProposal(0, true);
        await proposalSystem.connect(user2).voteOnProposal(0, true);

        console.log("Proposal[0]: ", await proposalSystem.getSpecificProposal(0))
        console.log("Proposal[0] total votes: ", await proposalSystem.getProposalVotes(0));
      });

      it("Should revert with ProposalSystem__AlreadyVoted", async function () {
        const [owner, user1, user2] = await ethers.getSigners();
        const reachToken = await ethers.deployContract("ReachToken", [1_000_000]);
        const proposalSystem = await ethers.deployContract("ProposalSystem", [reachToken.getAddress()])

        const valueTransferred = 2_000_000;
        await reachToken.transfer(user1.address, valueTransferred);
        await reachToken.transfer(user2.address, valueTransferred);

        console.log("User1 total balance: ", await reachToken.balanceOf(user1.address))
        console.log("User2 total balance: ", await reachToken.balanceOf(user2.address))

        const proposalDescription = "Questa è la mia proposta";
        await proposalSystem.connect(user1).createProposal(proposalDescription);

        await proposalSystem.connect(user1).voteOnProposal(0, true);
        await proposalSystem.connect(user2).voteOnProposal(0, true);

        console.log("Percentage of vote for: ", await proposalSystem.getProposalVoteForPercentage(0))

        await expect(proposalSystem.connect(user1).voteOnProposal(0, true)).to.be.revertedWithCustomError(proposalSystem, "ProposalSystem__AlreadyVoted")
      });
})