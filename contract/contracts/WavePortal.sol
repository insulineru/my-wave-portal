// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    address[] waveSenders; // TODO: Переписать на mapping
    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    Wave[] waves;

    constructor() {
        console.log("Yo yo, I am a contract am I am smart");
    }

    function wave(string memory _message) public {
        totalWaves += 1;
        waveSenders.push(msg.sender); // TODO: Переписать на mapping

        waves.push(Wave(msg.sender, _message, block.timestamp));
        emit NewWave(msg.sender, block.timestamp, _message);

        console.log("%s has waved!", msg.sender);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function getWaveSendersCount() public view returns (uint256) {
        console.log("We have %d total senders!", waveSenders.length);
        return waveSenders.length;
    }
}
