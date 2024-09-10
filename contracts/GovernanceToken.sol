// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20 {
    address public immutable i_owner;

    error GovernanceToken__NotOwner();
    error GovernanceToken__NotEnoughTokens();

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert GovernanceToken__NotOwner();
        }
        _;
    }

    constructor(uint256 _initialSupply) ERC20("GovernanceToken", "GTK") {
        i_owner = msg.sender;
        _mint(i_owner, (_initialSupply / 2) * 10 ** decimals());
        _mint(address(this), (_initialSupply / 2) * 10 ** decimals());
    }

    function fundSustainableDao(address _sustainableDaoAddress, uint256 _amount) public onlyOwner {
        if(_amount > balanceOf(address(this))) {
            revert GovernanceToken__NotEnoughTokens();
        }
        _transfer(address(this), _sustainableDaoAddress, _amount);
    }
}
