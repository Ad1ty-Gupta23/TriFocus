// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HabitStaking {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct User {
        uint256 stakedTokens;
        uint256 habitStreak;
        uint256 earnedTokens;
    }

    struct Therapist {
        address therapistAddress;
        string name;
        bool verified;
    }

    struct Booking {
        address user;
        uint256 timestamp;
        uint256 sessionFee;
        string encryptedReportCID; // IPFS hash
    }

    mapping(address => User) public users;
    mapping(address => Therapist) public therapists;
    mapping(address => Booking[]) public therapistBookings;

    event TokensStaked(address indexed user, uint256 amount);
    event TaskCompleted(address indexed user, uint256 reward);
    event TokensRedeemed(address indexed user, uint256 amount);
    event TherapistRegistered(address therapist, string name);
    event SessionBooked(address user, address therapist, uint256 sessionFee);
    event ReportUploaded(address therapist, address user, string ipfsCID);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyTherapist() {
        require(therapists[msg.sender].verified, "Not a verified therapist");
        _;
    }

    function stakeTokens(uint256 amount) external {
        users[msg.sender].stakedTokens += amount;
        emit TokensStaked(msg.sender, amount);
    }

    function completeTask(uint256 reward) external {
        users[msg.sender].earnedTokens += reward;
        users[msg.sender].habitStreak += 1;
        emit TaskCompleted(msg.sender, reward);
    }

    function redeemTokens(uint256 amount) external {
        require(users[msg.sender].earnedTokens >= amount, "Not enough tokens");
        users[msg.sender].earnedTokens -= amount;
        emit TokensRedeemed(msg.sender, amount);
    }

    function registerTherapist(string memory name) external {
        require(therapists[msg.sender].therapistAddress == address(0), "Already registered");
        therapists[msg.sender] = Therapist({
            therapistAddress: msg.sender,
            name: name,
            verified: true
        });
        emit TherapistRegistered(msg.sender, name);
    }

    function bookTherapist(address therapistAddr, uint256 sessionFee) external {
        require(therapists[therapistAddr].verified, "Therapist not verified");
        require(users[msg.sender].earnedTokens >= sessionFee, "Not enough tokens");

        users[msg.sender].earnedTokens -= sessionFee;
        therapistBookings[therapistAddr].push(Booking({
            user: msg.sender,
            timestamp: block.timestamp,
            sessionFee: sessionFee,
            encryptedReportCID: ""
        }));

        emit SessionBooked(msg.sender, therapistAddr, sessionFee);
    }

    function uploadEncryptedReport(address user, string memory ipfsCID) external onlyTherapist {
        Booking[] storage bookings = therapistBookings[msg.sender];
        for (uint256 i = 0; i < bookings.length; i++) {
            if (bookings[i].user == user && bytes(bookings[i].encryptedReportCID).length == 0) {
                bookings[i].encryptedReportCID = ipfsCID;
                emit ReportUploaded(msg.sender, user, ipfsCID);
                return;
            }
        }
        revert("No matching booking found");
    }

    function getMyBookings() external view returns (Booking[] memory) {
        return therapistBookings[msg.sender];
    }

    function getUserTokens(address user) external view returns (uint256) {
        return users[user].earnedTokens;
    }
} 
