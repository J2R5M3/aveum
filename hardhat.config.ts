import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts:
        process.env.VITE_PRIVATE_KEY !== undefined
          ? [process.env.VITE_PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
