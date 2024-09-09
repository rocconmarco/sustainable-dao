/* import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReachToken contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    const reachToken = await ethers.deployContract("ReachToken");
    const ownerBalance = await reachToken.balanceOf(owner.address);
    expect(await reachToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens from sender to receiver", async function() {
    const [owner, receiver] = await ethers.getSigners();
    const reachToken = await ethers.deployContract("ReachToken");

    
    const totalSupply = BigInt(1000000) * BigInt(10 ** 18);
    const transferAmount = BigInt(10000) * BigInt(10 ** 18);


    await reachToken.transfer(receiver.address, transferAmount);

    const receiverBalance = await reachToken.balanceOf(receiver.address);
    expect(receiverBalance).to.equal(transferAmount);

    const expectedOwnerBalance = totalSupply - transferAmount;
    const ownerBalance = await reachToken.balanceOf(owner.address);

    expect(ownerBalance).to.equal(expectedOwnerBalance);

});


  it("Should revert due to insufficient balance", async function() {
        const [owner, receiver] = await ethers.getSigners();
        const reachToken = await ethers.deployContract("ReachToken");
        const ownerBalance = await reachToken.balanceOf(owner.address);
        await expect(reachToken.transfer(receiver.address, ownerBalance + BigInt(1))).to.be.reverted;
        expect(await reachToken.balanceOf(owner.address)).to.equal(ownerBalance);
        })
});

it("Should grant the spender rights over a certain amount of tokens", async function() {
    const [owner, spender] = await ethers.getSigners();
    const reachToken = await ethers.deployContract("ReachToken");
    const approvedValue = BigInt(10000) * BigInt(10 ** 18);

    await reachToken.approve(spender.address, approvedValue);

    const allowance = await reachToken.allowance(owner.address, spender.address)
    expect(allowance).to.be.equal(approvedValue);
    console.log("Allowance: %d", allowance);

})

it("Should allow the spender to transfer a certain amount with the transferFrom function", async function() {
    const [owner, spender, receiver] = await ethers.getSigners();
    const reachToken = await ethers.deployContract("ReachToken");

    const approveAmount = BigInt(10000) * BigInt(10 ** 18);
    await reachToken.approve(spender.address, approveAmount);

    await reachToken.connect(spender).transferFrom(owner.address, receiver.address, approveAmount);

    const receiverBalance = await reachToken.balanceOf(receiver.address);
    expect(receiverBalance).to.equal(approveAmount);

    const remainingAllowance = await reachToken.allowance(owner.address, spender.address);
    expect(remainingAllowance).to.equal(0);
})

it("Should return the right name and symbol of the token", async function() {
    const [owner] = await ethers.getSigners();
    const reachToken = await ethers.deployContract("ReachToken");

    const name = await reachToken.name();
    const symbol = await reachToken.symbol();

    expect(name).to.be.equal("ReachToken");
    expect(symbol).to.be.equal("RCH");
})

// Errore aspettato: ERC20InsufficientBalance
 */