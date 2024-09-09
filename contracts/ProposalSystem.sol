// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProposalSystem {
    error ProposalSystem__DescriptionCannotBeEmpty();
    error ProposalSystem__NotAMember();
    error ProposalSystem__NotOwner();
    error ProposalSystem__AlreadyVoted();
    error ProposalSystem__NotADelegate();
    error ProposalSystem__HasDelegatedTheVote();

    struct Proposal {
        address proposer;
        string description;
        uint256 voteFor;
        uint256 voteAgainst;
        uint256 voteCount;
        bool executed;
    }

    IERC20 public governanceToken;
    address public immutable i_owner;
    Proposal[] public s_proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => mapping(address => uint256)) public delegation;
    mapping(address => address[]) public delegators;
    mapping(address => bool) isDelegate;
    mapping(address => bool) hasDelegatedTheVote;

    event ProposalCreated(
        address indexed _proposer,
        uint256 indexed _proposalIndex
    );

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert ProposalSystem__NotOwner();
        }
        _;
    }

    modifier onlyMembers() {
        if (governanceToken.balanceOf(msg.sender) == 0) {
            revert ProposalSystem__NotAMember();
        }
        _;
    }

    modifier notDelegants() {
        if (hasDelegatedTheVote[msg.sender]) {
            revert ProposalSystem__HasDelegatedTheVote();
        }
        _;
    }

    modifier onlyDelegates() {
        if(!isDelegate[msg.sender]) {
            revert ProposalSystem__NotADelegate();
        }
        _;
    }

    function createProposal(string memory _description) public onlyMembers {
        if (bytes(_description).length <= 0) {
            revert ProposalSystem__DescriptionCannotBeEmpty();
        }

        Proposal memory newProposal = Proposal({
            proposer: msg.sender,
            description: _description,
            voteFor: 0,
            voteAgainst: 0,
            voteCount: 0,
            executed: false
        });
        s_proposals.push(newProposal);
        emit ProposalCreated(msg.sender, s_proposals.length - 1);
    }

    function voteOnProposal(uint256 _proposalIndex, bool voteFor) public onlyMembers notDelegants {
        if (hasVoted[msg.sender][_proposalIndex]) {
            revert ProposalSystem__AlreadyVoted();
        }

        uint256 voterTokens = governanceToken.balanceOf(msg.sender);

        if (voteFor) {
            s_proposals[_proposalIndex].voteFor += voterTokens;
        } else {
            s_proposals[_proposalIndex].voteAgainst += voterTokens;
        }
        s_proposals[_proposalIndex].voteCount += voterTokens;
        hasVoted[msg.sender][_proposalIndex] = true;
    }

    function delegateVote(address _delegate) public onlyMembers {
        delegation[_delegate][msg.sender] = governanceToken.balanceOf(msg.sender);
        isDelegate[_delegate] = true;
        delegators[_delegate].push(msg.sender);
        hasDelegatedTheVote[msg.sender] = true;
    }

    function voteAsADelegate(uint256 _proposalIndex, bool voteFor) public onlyMembers onlyDelegates {
        if (hasVoted[msg.sender][_proposalIndex]) {
            revert ProposalSystem__AlreadyVoted();
        }
        uint256 voterTokens = getTotalVotingPower(msg.sender);

        if (voteFor) {
            s_proposals[_proposalIndex].voteFor += voterTokens;
        } else {
            s_proposals[_proposalIndex].voteAgainst += voterTokens;
        }
        s_proposals[_proposalIndex].voteCount += voterTokens;
        hasVoted[msg.sender][_proposalIndex] = true;

        address[] memory delegants = delegators[msg.sender];
        for(uint256 i = 0; i < delegants.length; i++) {
            hasVoted[delegants[i]][_proposalIndex] = true;
        }
    }

    function getTotalVotingPower(address _delegate) internal view returns(uint256) {
        uint256 totalVotingPower = governanceToken.balanceOf(_delegate);
        address[] memory delegants = delegators[_delegate];
        for(uint256 i = 0; i < delegants.length; i++) {
            totalVotingPower += delegation[_delegate][delegants[i]];
        }
        return totalVotingPower;
    }

    function getSpecificProposal(
        uint256 _proposalIndex
    ) public view returns (Proposal memory) {
        return s_proposals[_proposalIndex];
    }

    function getListOfAllProposals() public view returns (Proposal[] memory) {
        return s_proposals;
    }

    function getProposalVotes(uint256 _proposalIndex) public view returns(uint256) {
        return s_proposals[_proposalIndex].voteCount;
    }

    function getProposalVoteForPercentage(uint256 _proposalIndex) public view returns(uint256) {
        uint256 voteForPercentage = ((s_proposals[_proposalIndex].voteFor * 100) / s_proposals[_proposalIndex].voteCount);
        return voteForPercentage;
    }
}
