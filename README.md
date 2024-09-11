<br />
<div id="readme-top" align="center">

<h3 align="center">Sustainable Dao</h3>

  <p align="center">
    DAO project implementing decentralized proposal and voting system.
    <br />
    <a href="https://github.com/rocconmarco/sustainable-dao"><strong>Repository GitHub »</strong></a>
    <br />
  </p>
</div>

## About The Project

The project was created as part of the "Smart Contract with Solidity Advanced" course of the Master's program in Blockchain Development at start2impact University. 

<br>

The goal was to build a DAO (Decentralized Autonomous Organization) for a company that offers training courses focused on the objectives of the 2030 Agenda.

<br>

The DAO allows the company to incentivize community engagement through proposals and voting, in which DAO members can participate.

<br>

## Specs for nerds

Starting from the basics, I decided to use the OpenZeppelin library to implement the governance token. Upon deploying the contract, half of the initial supply will be assigned to the owner (this allows flexibility in token management and for emergency situations), while the other half will be held in the GovernanceToken.sol contract.

<br>

Within GovernanceToken.sol, I implemented the fundSustainableDao function, which allows ONLY the owner to transfer tokens held by the contract to the SustainableDao.sol contract, which will manage the sale of tokens to the end users.

<br>

Before creating a proposal, users will need to purchase governance tokens and become members of the DAO. This can be done via the buyTokens function in the SustainableDao.sol contract. The collected funds will be held within the contract, and the corresponding amount of governance tokens (priced by default at 0.01 ETH) will be transferred to the user's balance, certifying their membership in the DAO.

<br>

Once a user becomes a member, they can create a proposal by providing a detailed description and publishing it on the blockchain. Proposals with an empty description cannot be submitted.

<br>

Once published, users will have 2 days to vote for or against the proposal (the timelockDuration can be modified by the contract owner via a dedicated function). Voting can be done through direct democracy (the user votes autonomously, with their vote weighted according to the tokens they hold) or through liquid democracy (the user delegates someone else to vote on their behalf).

<br>

After the 2-day period ends, the contract owner can call the executeProposal function, and if the proposal has received a majority of favorable votes, it will be marked as executed.

<br>

All proposals are available for consultation in an array stored on-chain, which includes the proposer’s address, votes for and against, the total number of votes, the creation timestamp, and a boolean variable indicating whether the proposal has been executed.

<br>

### Testing

<br>

The two smart contracts have been thoroughly tested using the Hardhat framework. Comprehensive tests were designed for each contract, aiming to cover 100% of the functions.

<br>

<img src="./img/testing.png" alt="Testing" width="800">

<br>

### Custom Errors

The latest conventions in error handling and gas optimization have been followed. Custom errors were created for every potential error in the protocol's usage, implementing them, where appropriate, in a dedicated modifier to improve code modularity.

<br>

### Naming Conventions

For greater clarity in code writing and to improve maintainability, the following conventions have been adopted:

<ul>
    <li>Storage variables: s_variableName</li>
    <li>Immutable variables: i_variableName</li>
    <li>Custom errors: ContractName_CustomErrorName</li>
</ul>

<br>

## Contacts

<strong>Marco Roccon - Digital Innovation & Development</strong><br>
Portfolio website: https://rocconmarco.github.io/<br>
Linkedin: https://www.linkedin.com/in/marcoroccon/<br>
GitHub: https://github.com/rocconmarco

<br>



## Copyright

© 2024 Marco Roccon. All rights reserved.
