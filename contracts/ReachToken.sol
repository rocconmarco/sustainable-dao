// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReachToken is ERC20 {
    constructor(uint256 _initialSupply) ERC20("ReachToken", "RCH") {
        _mint(msg.sender, _initialSupply * 10 ** decimals());
    }
}