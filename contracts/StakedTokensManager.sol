// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakedTokensManager {
    IERC20 public immutable i_governanceToken;

    mapping(address => uint256) s_stakedBalances;
    address[] public s_usersWithStakedTokens;

    error StakedTokensManager__NotSustainableDaoContract();
    error StakedTokensManager__NoTokensStaked();
    error StakedTokensManager__TransferFromSustainableDaoFailed();

    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);

    constructor(address _governanceToken) {
        i_governanceToken = IERC20(_governanceToken);
    }

    function stakeTokens(address _user, uint256 _amount) external {
        bool transferFromSustainableDaoSuccess = i_governanceToken.transferFrom(msg.sender, address(this), _amount);
        if (!transferFromSustainableDaoSuccess) {
            revert StakedTokensManager__TransferFromSustainableDaoFailed();
        }
        s_stakedBalances[_user] += _amount;
        if (s_stakedBalances[_user] == _amount) {
            s_usersWithStakedTokens.push(_user);
        }
        emit TokensStaked(_user, _amount);
    }

    function unstakeTokens(address _user) external {
        uint256 amount = s_stakedBalances[_user];
        if (amount == 0) {
            revert StakedTokensManager__NoTokensStaked();
        }
        s_stakedBalances[_user] = 0;
        i_governanceToken.transfer(_user, amount);
        emit TokensUnstaked(_user, amount);
    }

    function getUsersWithStakedTokensLength() external view returns (uint256) {
        return s_usersWithStakedTokens.length;
    }

    function getUserStakedTokens(address _user) public view returns (uint256) {
        return s_stakedBalances[_user];
    }
}
