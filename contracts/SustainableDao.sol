// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {StakedTokensManager} from "./StakedTokensManager.sol";

contract SustainableDao {
    error SustainableDao__DescriptionCannotBeEmpty();
    error SustainableDao__NotAMember();
    error SustainableDao__NotOwner();
    error SustainableDao__AlreadyVoted();
    error SustainableDao__NotADelegate();
    error SustainableDao__UserHasDelegatedTheVote();
    error SustainableDao__SaleClosed();
    error SustainableDao__SendEtherToPurchaseTokens();
    error SustainableDao__NotEnoughTokensInTheContract();
    error SustainableDao__VotingStillInProgress();
    error SustainableDao__ProposalDidNotPass();
    error SustainableDao__ProposalAlreadyFinalized();
    error SustainableDao__TokensNotApproved();
    error SustainableDao__NoTokensToApprove();
    error SustainableDao__TokenTransferToSustainableDaoContractFailed();
    error SustainableDao__TokenApprovalToStakedTokensManagerContractFailed();
    error SustainableDao__NoAvailableTokens();
    error SustainableDao__VotingClosed();
    error SustainableDao__InvalidProposalIndex();

    struct Proposal {
        address proposer;
        string description;
        uint256 voteFor;
        uint256 voteAgainst;
        uint256 voteCount;
        uint256 creationTime;
        uint256 endVotingTimestamp;
        bool finalized;
        bool approved;
    }

    ERC20 public governanceToken;
    StakedTokensManager public stakedTokensManager;
    address public immutable i_owner;
    Proposal[] public s_proposals;
    mapping(address => mapping(uint256 => bool)) public s_hasVoted;
    mapping(address => mapping(address => uint256)) public s_delegation;
    mapping(address => address[]) public s_delegators;
    mapping(address => bool) s_isDelegate;
    mapping(address => bool) s_hasDelegatedTheVote;
    uint256 public s_tokenPrice = 1 * 10 ** 16;
    bool public s_saleOpen = true;
    uint256 public s_timelockDuration = 2 days;

    event ProposalCreated(address indexed _proposer, uint256 indexed _proposalIndex);

    event VoteRegistered(address indexed _voter, bool indexed _voteFor, uint256 indexed _proposalIndex);

    event ProposalApproved(uint256 indexed _proposalIndex, uint256 indexed _voteFor, uint256 indexed _voteAgainst);

    event ProposalFailed(uint256 indexed _proposalIndex, uint256 indexed _voteFor, uint256 indexed _voteAgainst);

    event TokensApproved(address indexed approver, address indexed spender, uint256 tokensApproved);

    event VoteDelegated(address indexed _delegant, address indexed _delegate);

    event TokenPurchased(address indexed _buyer, uint256 indexed _amount);

    event NewTokenPriceSet(uint256 indexed _newPrice);

    event NewTimelockDurationSet(uint256 indexed _daysInSeconds);

    event SaleClosed();

    constructor(address _governanceToken, address _stakedTokensManager) {
        governanceToken = ERC20(_governanceToken);
        stakedTokensManager = StakedTokensManager(_stakedTokensManager);
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert SustainableDao__NotOwner();
        }
        _;
    }

    modifier onlyMembersWithAvailableTokens() {
        if (governanceToken.balanceOf(msg.sender) == 0) {
            revert SustainableDao__NoAvailableTokens();
        }
        _;
    }

    modifier notDelegants() {
        if (s_hasDelegatedTheVote[msg.sender]) {
            revert SustainableDao__UserHasDelegatedTheVote();
        }
        _;
    }

    modifier onlyDelegates() {
        if (!s_isDelegate[msg.sender]) {
            revert SustainableDao__NotADelegate();
        }
        _;
    }

    function createProposal(string memory _description) public onlyMembersWithAvailableTokens {
        if (bytes(_description).length <= 0) {
            revert SustainableDao__DescriptionCannotBeEmpty();
        }

        Proposal memory newProposal = Proposal({
            proposer: msg.sender,
            description: _description,
            voteFor: 0,
            voteAgainst: 0,
            voteCount: 0,
            creationTime: block.timestamp,
            endVotingTimestamp: block.timestamp + s_timelockDuration,
            finalized: false,
            approved: false
        });
        s_proposals.push(newProposal);
        emit ProposalCreated(msg.sender, s_proposals.length - 1);
    }

    function voteOnProposal(uint256 _proposalIndex, bool voteFor) public onlyMembersWithAvailableTokens notDelegants {
        if(_proposalIndex >= s_proposals.length) {
            revert SustainableDao__InvalidProposalIndex();
        }

        if(block.timestamp > s_proposals[_proposalIndex].endVotingTimestamp) {
            revert SustainableDao__VotingClosed();
        }

        if (s_hasVoted[msg.sender][_proposalIndex]) {
            revert SustainableDao__AlreadyVoted();
        }

        uint256 voterTokens = governanceToken.balanceOf(msg.sender);

        bool transferSuccess = governanceToken.transferFrom(msg.sender, address(this), voterTokens);
        if (!transferSuccess) {
            revert SustainableDao__TokenTransferToSustainableDaoContractFailed();
        }

        bool approvalSuccess = governanceToken.approve(address(stakedTokensManager), voterTokens);
        if (!approvalSuccess) {
            revert SustainableDao__TokenApprovalToStakedTokensManagerContractFailed();
        }

        if (voteFor) {
            s_proposals[_proposalIndex].voteFor += voterTokens;
        } else {
            s_proposals[_proposalIndex].voteAgainst += voterTokens;
        }
        s_proposals[_proposalIndex].voteCount += voterTokens;
        stakedTokensManager.stakeTokens(msg.sender, voterTokens);
        s_hasVoted[msg.sender][_proposalIndex] = true;
        emit VoteRegistered(msg.sender, voteFor, _proposalIndex);
    }

    function delegateVote(address _delegate) public onlyMembersWithAvailableTokens {
        uint256 delegantTokens = governanceToken.balanceOf(msg.sender);

        bool transferSuccess = governanceToken.transferFrom(msg.sender, address(this), delegantTokens);
        if (!transferSuccess) {
            revert SustainableDao__TokenTransferToSustainableDaoContractFailed();
        }

        bool approvalSuccess = governanceToken.approve(address(stakedTokensManager), delegantTokens);
        if (!approvalSuccess) {
            revert SustainableDao__TokenApprovalToStakedTokensManagerContractFailed();
        }

        s_delegation[_delegate][msg.sender] = delegantTokens;
        s_isDelegate[_delegate] = true;
        s_delegators[_delegate].push(msg.sender);
        s_hasDelegatedTheVote[msg.sender] = true;

        stakedTokensManager.stakeTokens(msg.sender, delegantTokens);

        emit VoteDelegated(msg.sender, _delegate);
    }

    function voteAsADelegate(uint256 _proposalIndex, bool voteFor) public onlyMembersWithAvailableTokens onlyDelegates {
        if(_proposalIndex >= s_proposals.length) {
            revert SustainableDao__InvalidProposalIndex();
        }

        if(block.timestamp > s_proposals[_proposalIndex].endVotingTimestamp) {
            revert SustainableDao__VotingClosed();
        }

        if (s_hasVoted[msg.sender][_proposalIndex]) {
            revert SustainableDao__AlreadyVoted();
        }
        
        uint256 voterTokens = getTotalVotingPower(msg.sender);
        uint256 delegateTokens = governanceToken.balanceOf(msg.sender);

        bool transferSuccess = governanceToken.transferFrom(msg.sender, address(this), delegateTokens);
        if (!transferSuccess) {
            revert SustainableDao__TokenTransferToSustainableDaoContractFailed();
        }

        bool approvalSuccess = governanceToken.approve(address(stakedTokensManager), delegateTokens);
        if (!approvalSuccess) {
            revert SustainableDao__TokenApprovalToStakedTokensManagerContractFailed();
        }

        if (voteFor) {
            s_proposals[_proposalIndex].voteFor += voterTokens;
        } else {
            s_proposals[_proposalIndex].voteAgainst += voterTokens;
        }
        s_proposals[_proposalIndex].voteCount += voterTokens;
        s_hasVoted[msg.sender][_proposalIndex] = true;

        address[] memory delegants = s_delegators[msg.sender];
        for (uint256 i = 0; i < delegants.length; i++) {
            s_hasVoted[delegants[i]][_proposalIndex] = true;
            emit VoteRegistered(delegants[i], voteFor, _proposalIndex);
        }
        stakedTokensManager.stakeTokens(msg.sender, delegateTokens);
        emit VoteRegistered(msg.sender, voteFor, _proposalIndex);
    }

    function finalizeProposal(uint256 _proposalIndex) public onlyOwner {
        Proposal storage proposal = s_proposals[_proposalIndex];
        if (block.timestamp <= proposal.creationTime + s_timelockDuration) {
            revert SustainableDao__VotingStillInProgress();
        }
        if (proposal.finalized == true) {
            revert SustainableDao__ProposalAlreadyFinalized();
        }
        for (uint256 i = 0; i < stakedTokensManager.getUsersWithStakedTokensLength(); i++) {
            address user = stakedTokensManager.s_usersWithStakedTokens(i);
            stakedTokensManager.unstakeTokens(user);
        }
        if (proposal.voteFor < proposal.voteAgainst) {
            proposal.finalized = true;
            proposal.approved = false;
            emit ProposalFailed(_proposalIndex, proposal.voteFor, proposal.voteAgainst);
            return;
        }
        proposal.finalized = true;
        proposal.approved = true;


        emit ProposalApproved(_proposalIndex, proposal.voteFor, proposal.voteAgainst);
    }

    function buyTokens() public payable {
        if (msg.value == 0) {
            revert SustainableDao__SendEtherToPurchaseTokens();
        }
        if (!s_saleOpen) {
            revert SustainableDao__SaleClosed();
        }
        uint256 tokensToBuy = (msg.value / s_tokenPrice) * 10 ** governanceToken.decimals();
        if (tokensToBuy > governanceToken.balanceOf(address(this))) {
            revert SustainableDao__NotEnoughTokensInTheContract();
        }
        governanceToken.transfer(msg.sender, tokensToBuy);
        emit TokenPurchased(msg.sender, tokensToBuy);
    }

    function setTokenPrice(uint256 _price) public onlyOwner {
        s_tokenPrice = _price;
        emit NewTokenPriceSet(_price);
    }

    function closeSale() public onlyOwner {
        s_saleOpen = false;
        emit SaleClosed();
    }

    function setTimelockDuration(uint256 _days) public onlyOwner {
        s_timelockDuration = _days * 1 days;
        emit NewTimelockDurationSet(_days * 1 days);
    }

    function getTimelockDuration() public view returns (uint256) {
        return s_timelockDuration;
    }

    function getSaleOpen() public view returns (bool) {
        return s_saleOpen;
    }

    function getTotalVotingPower(address _delegate) internal view returns (uint256) {
        uint256 totalVotingPower = governanceToken.balanceOf(_delegate);
        address[] memory delegants = s_delegators[_delegate];
        for (uint256 i = 0; i < delegants.length; i++) {
            totalVotingPower += s_delegation[_delegate][delegants[i]];
        }
        return totalVotingPower;
    }

    function getSpecificProposal(uint256 _proposalIndex) public view returns (Proposal memory) {
        return s_proposals[_proposalIndex];
    }

    function getListOfAllProposals() public view returns (Proposal[] memory) {
        return s_proposals;
    }

    function getProposalVotes(uint256 _proposalIndex) public view returns (uint256) {
        return s_proposals[_proposalIndex].voteCount;
    }

    function getProposalVoteForPercentage(uint256 _proposalIndex) public view returns (uint256) {
        uint256 voteForPercentage = ((s_proposals[_proposalIndex].voteFor * 100) /
            s_proposals[_proposalIndex].voteCount);
        return voteForPercentage;
    }

    function getHasVoted(address _voter, uint256 _proposalIndex) public view returns (bool) {
        return s_hasVoted[_voter][_proposalIndex];
    }

    function getTokenPrice() public view returns (uint256) {
        return s_tokenPrice;
    }
}
