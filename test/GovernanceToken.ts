import { expect } from "chai";
import { ethers } from "hardhat";

describe("GovernanceToken contract", function () {
  it("Should set the token name to GovernanceToken, and symbol to GTK", async function() {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);

    const tokenName = await governanceToken.name();
    const tokenSymbol = await governanceToken.symbol();

    expect(tokenName).to.equal("GovernanceToken");
    expect(tokenSymbol).to.equal("GTK");

    // console.log("Token name: ", tokenName);
    // console.log("Token symbol: ", tokenSymbol);
  })
  
  it("Deployment should assign the half of the supply to the owner, and half of the supply to the contract", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);

    const totalSupply = await governanceToken.totalSupply();
    const halfSupply = totalSupply / BigInt(2);

    const ownerBalance = await governanceToken.balanceOf(owner.address);
    const contractBalance = await governanceToken.balanceOf(
      governanceToken.getAddress()
    );
    expect(halfSupply).to.equal(ownerBalance);
    expect(halfSupply).to.equal(contractBalance);

    // console.log("Owner balance after deployment", ownerBalance);
    // console.log("GovernanceToken contract balance after deployment", contractBalance);
  });

  it("Should transfer token from GovernanceToken contract to SustainableDao contract", async function () {
    const [owner] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()])
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(), stakedTokensManager.getAddress()
    ]);

    const fundingAmount = ethers.parseUnits("500000");

    await governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount)
    expect(await governanceToken.balanceOf(sustainableDao.getAddress())).to.equal(fundingAmount);

    // console.log("SustainableDao contract balance after transfer: ", await governanceToken.balanceOf(sustainableDao.getAddress()))
    // console.log("GovernanceToken contract balance after transfer: ", await governanceToken.balanceOf(governanceToken.getAddress()))
    // console.log("Owner balance: ", await governanceToken.balanceOf(owner.address))
  });

  it("Should revert with custom error GovernanceToken__NotOwner", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 1_000_000;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()])
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(), stakedTokensManager.getAddress()
    ]);

    const fundingAmount = ethers.parseUnits("500000");

    await expect(governanceToken.connect(user1).fundSustainableDao(sustainableDao.getAddress(), fundingAmount)).to.be.revertedWithCustomError(governanceToken, "GovernanceToken__NotOwner")
  });

  it("Should revert with custom error GovernanceToken__NotEnoughTokens", async function () {
    const [owner, user1] = await ethers.getSigners();
    const initialSupply = 0;
    const governanceToken = await ethers.deployContract("GovernanceToken", [
      initialSupply,
    ]);
    const stakedTokensManager = await ethers.deployContract("StakedTokensManager", [governanceToken.getAddress()])
    const sustainableDao = await ethers.deployContract("SustainableDao", [
      governanceToken.getAddress(), stakedTokensManager.getAddress()
    ]);

    const fundingAmount = ethers.parseUnits("500000");

    await expect(governanceToken.fundSustainableDao(sustainableDao.getAddress(), fundingAmount)).to.be.revertedWithCustomError(governanceToken, "GovernanceToken__NotEnoughTokens")
  });
});