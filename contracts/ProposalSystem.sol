// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProposalSystem {
    error ProposalSystem__DescriptionCannotBeEmpty();
    error ProposalSystem__NotAMember();
    error ProposalSystem__NotOwner();
    error ProposalSystem__AlreadyVoted();

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

    function voteOnProposal(uint256 _proposalIndex, bool voteFor) public onlyMembers {
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
