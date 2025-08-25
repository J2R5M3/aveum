# LayerZero Smart Contract

This directory contains the `SimpleOApp.sol` smart contract, which is a simple example of a LayerZero Omnichain Application (OApp).

## Compiling and Deploying

To compile and deploy this contract, you will need to use a development environment like Hardhat.

### 1. Install Hardhat

If you don't have Hardhat installed, run the following command in the root of the project:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Create a Hardhat project

Run the following command in the root of the project to create a Hardhat project:

```bash
npx hardhat
```

Select "Create a TypeScript project" and follow the prompts. This will create a `hardhat.config.ts` file and other necessary files.

### 3. Configure Hardhat

You will need to configure Hardhat to deploy to the testnets you want to use (e.g., Sepolia and Mumbai). You will need to add your private key and RPC URLs for these networks to your `hardhat.config.ts` file.

Here is an example `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "YOUR_SEPOLIA_RPC_URL",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
    mumbai: {
      url: "YOUR_MUMBAI_RPC_URL",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
  },
};

export default config;
```

### 4. Create a deployment script

Create a new file in the `scripts` directory called `deploy.ts`. This script will deploy the `SimpleOApp` contract to the testnets.

Here is an example `deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the endpoint address for the network you are deploying to.
  // A list of endpoints can be found here: https://docs.layerzero.network/v2/deployments/deployed-contracts
  const endpointAddress = "ENDPOINT_ADDRESS_FOR_THE_NETWORK"; // e.g., for Sepolia: 0x...

  const simpleOApp = await ethers.deployContract("SimpleOApp", [endpointAddress, deployer.address]);

  await simpleOApp.waitForDeployment();

  console.log(`SimpleOApp deployed to: ${simpleOApp.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 5. Deploy the contract

Run the following command to deploy the contract to a testnet:

```bash
npx hardhat run scripts/deploy.ts --network <network_name>
```

For example, to deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

You will need to run this command for each testnet you want to deploy to. After deploying, you will need to link the contracts on the different chains using the LayerZero documentation.
