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

The project was created as part of the <strong>"Smart Contract with Solidity Advanced"</strong> course of the Master's program in Blockchain Development at start2impact University.

<br>

The goal was to build a <strong>DAO (Decentralized Autonomous Organization)</strong> for a company that offers training courses focused on the objectives of the 2030 Agenda.

<br>

The DAO allows the company to <strong>incentivize community engagement</strong> through proposals and voting, in which DAO members can participate.

<br>

## Specs for nerds (v.1.0)

Starting from the basics, I decided to use the <strong>OpenZeppelin library</strong> to implement the governance token. Upon deploying the contract, <strong>half of the initial supply</strong> will be <strong>assigned to the owner</strong> (this allows flexibility in token management and for emergency situations), while the other half will be <strong>held in the GovernanceToken.sol contract.</strong>

<br>

Within GovernanceToken.sol, I implemented the fundSustainableDao function, which allows <strong>ONLY the owner</strong> to transfer tokens held by the contract to the SustainableDao.sol contract, which will manage the <strong>sale of tokens to the end users.</strong>

<br>

Before creating a proposal, users will need to purchase governance tokens and <strong>become members of the DAO.</strong> This can be done via the buyTokens function in the SustainableDao.sol contract. The collected funds will be held within the contract, and the corresponding amount of governance tokens (priced <strong>by default at 0.01 ETH</strong>) will be transferred to the user's balance, certifying their membership in the DAO.

<br>

Once a user becomes a member, they can <strong>create a proposal</strong> by providing a detailed description and publishing it on the blockchain. Proposals with an empty description cannot be submitted.

<br>

Once published, users will have <strong>2 days to vote</strong> for or against the proposal (the timelockDuration can be modified by the contract owner via a dedicated function). Voting can be done through <strong>direct democracy</strong> (the user votes autonomously, with their vote weighted according to the tokens they hold) or through <strong>liquid democracy</strong> (the user delegates someone else to vote on their behalf).

<br>

After the 2-day period ends, the contract owner can <strong>call the executeProposal function</strong>, and if the proposal has received a majority of favorable votes, it will be marked as executed.

<br>

All proposals are <strong>available for consultation</strong> in an array stored on-chain, which includes the proposer’s address, votes for and against, the total number of votes, the creation timestamp, and a boolean variable indicating whether the proposal has been executed.

<br>

### Testing

The two smart contracts have been <strong>thoroughly tested</strong> using the <strong>Hardhat framework.</strong> Comprehensive tests were designed for each contract, aiming to cover <strong>100% of the functions.</strong>

<br>

<img src="./img/testing.png" alt="Testing" width="800">

<br>

### Custom Errors

The latest conventions in <strong>error handling and gas optimization</strong> have been followed. Custom errors were created for every potential error in the protocol's usage, implementing them, where appropriate, in a dedicated modifier to improve code modularity.

<br>

### Naming Conventions

For <strong>greater clarity</strong> in code writing and to <strong>improve maintainability</strong>, the following conventions have been adopted:

<ul>
    <li>Storage variables: s_variableName</li>
    <li>Immutable variables: i_variableName</li>
    <li>Custom errors: ContractName_CustomErrorName</li>
</ul>

<br>

## v.1.1 Implementations

### Token Staking

A <strong>staking system</strong> has been implemented that locks users' tokens after they vote on a proposal, <strong>preventing malicious activities</strong> like transferring tokens between accounts to cast multiple votes.

<br>

Token staking is managed through the a new contract (<strong>StakedTokensManager.sol</strong>), where <strong>users approve their tokens</strong> and the tokens are <strong>transferred to custody</strong> until the proposal is executed.

<br>

The voting process is now defined by the following steps:

<ul>
<li>Before voting, the user <strong>approves their token balance</strong> to SustainableDao.</li>
<li>The user's total balance is <strong>transferred to SustainableDao</strong>.</li>
<li>SustainableDao <strong>approves</strong> the same amount of tokens <strong>to StakedTokensManager</strong>.</li>
<li>The tokens are <strong>transferred to custody</strong> at StakedTokenManager.</li>
<li>The user's staked tokens and their address are <strong>recorded in the mappings</strong> s_stakedBalances and s_usersWithStakedTokens.</li>
</ul>

<br>

The tokens will be <strong>released</strong> once the proposal is <strong>finalized</strong> (either approved or rejected).

<br>

<ul>
<li>The contract owner will <strong>finalize the proposal</strong> after the voting period.</li>
<li>The <strong>addresses</strong> in the s_usersWithStakedTokens array are <strong>checked</strong>.</li>
<li>The addresses in the array will have their <strong>corresponding tokens credited back</strong> from the s_stakedBalances mapping.</li>
</ul>

<br>

The <strong>same staking mechanism</strong> is implemented if the user decides to <strong>delegate their vote</strong> to a third party.

<br>

By activating the <strong>delegateVote function</strong> (after approving the total token balance), the user will have their <strong>tokens locked</strong> until the proposal is finalized.

<br>

The delegate will have <strong>voting power</strong> equal to the sum of the <strong>tokens from their delegators</strong> plus their <strong>personal tokens</strong>. The latter will also be locked upon activating the voteAsDelegate function.

<br>

### End Voting Date

The 'Proposal' struct has been modified by adding the field <strong>endVotingTimestamp</strong>, which is initialized at the proposal's creation as the sum of the <strong>creation timestamp</strong> and the <strong>timelock duration</strong> set in the contract (or modified by the owner).

<br>

In the voting functions, a <strong>check</strong> has been implemented to verify whether the <strong>voting is still open</strong> by comparing the <strong>current timestamp with endVotingTimestamp</strong>.

<br>

## Contacts

<strong>Marco Roccon - Digital Innovation & Development</strong><br>
Portfolio website: https://rocconmarco.github.io/<br>
Linkedin: https://www.linkedin.com/in/marcoroccon/<br>
GitHub: https://github.com/rocconmarco

<br>

## Copyright

© 2024 Marco Roccon. All rights reserved.
