const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting HabitStaking Contract Deployment...\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Deployment Information:");
    console.log(`Deploying contracts with account: ${deployer.address}`);
    
    // Get account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH\n`);

    // Deploy HabitStaking contract
    console.log("📦 Deploying HabitStaking contract...");
    
    const HabitStaking = await ethers.getContractFactory("HabitStaking");
    const habitStaking = await HabitStaking.deploy();
    
    // Wait for deployment to be mined
    await habitStaking.waitForDeployment();
    
    const contractAddress = await habitStaking.getAddress();
    console.log(`✅ HabitStaking deployed to: ${contractAddress}`);
    console.log(`🔗 Transaction hash: ${habitStaking.deploymentTransaction().hash}\n`);

    // Verify contract owner
    const owner = await habitStaking.owner();
    console.log(`👑 Contract owner: ${owner}`);
    console.log(`✅ Owner verification: ${owner === deployer.address ? 'PASSED' : 'FAILED'}\n`);

    // Get network information
    const network = await ethers.provider.getNetwork();
    
    // Save deployment information
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        transactionHash: habitStaking.deploymentTransaction().hash,
        blockNumber: habitStaking.deploymentTransaction().blockNumber,
        deploymentTime: new Date().toISOString(),
        contractOwner: owner
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `${network.name || 'unknown'}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    // Generate ABI file
    const abiDir = path.join(__dirname, '..', 'abi');
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir, { recursive: true });
    }

    const abiFile = path.join(abiDir, 'HabitStaking.json');
    const artifact = await ethers.getContractFactory("HabitStaking");
    const abi = artifact.interface.formatJson();
    fs.writeFileSync(abiFile, abi);
    console.log(`📄 ABI saved to: ${abiFile}`);

    // Display contract functions for reference
    console.log("\n📚 Available Contract Functions:");
    console.log("👤 User Functions:");
    console.log("  - stakeTokens(uint256 amount)");
    console.log("  - completeTask(uint256 reward)");
    console.log("  - redeemTokens(uint256 amount)");
    console.log("  - bookTherapist(address therapistAddr, uint256 sessionFee)");
    
    console.log("\n👨‍⚕️ Therapist Functions:");
    console.log("  - registerTherapist(string memory name)");
    console.log("  - uploadEncryptedReport(address user, string memory ipfsCID)");
    console.log("  - getMyBookings()");
    
    console.log("\n👁️ View Functions:");
    console.log("  - users(address)");
    console.log("  - therapists(address)");
    console.log("  - getUserTokens(address user)");
    console.log("  - owner()");

    // Basic contract interaction test
    console.log("\n🧪 Running Basic Tests...");
    
    try {
        // Test contract is responsive
        const contractOwner = await habitStaking.owner();
        console.log(`✅ Contract responds correctly - Owner: ${contractOwner}`);
        
        // Test user data structure (should return default values)
        const userData = await habitStaking.users(deployer.address);
        console.log(`✅ User data structure accessible - Staked: ${userData.stakedTokens}, Earned: ${userData.earnedTokens}, Streak: ${userData.habitStreak}`);
        
    } catch (error) {
        console.error("❌ Basic test failed:", error.message);
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. Verify the contract on block explorer if needed");
    console.log("2. Update your frontend with the new contract address");
    console.log("3. Test contract functionality using the interaction scripts");
    console.log("4. Register therapists and start user interactions");

    // Return deployment info for further use
    return {
        contract: habitStaking,
        address: contractAddress,
        deployer: deployer.address,
        transactionHash: habitStaking.deploymentTransaction().hash
    };
}

// Handle deployment errors
main()
    .then((deploymentResult) => {
        console.log("\n✅ Deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });

module.exports = { main };