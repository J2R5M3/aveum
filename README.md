# Vue.js + Irys + LayerZero + Lit Protocol Integration

This project is a demonstration of how to integrate three powerful web3 technologies—Irys, LayerZero, and Lit Protocol—into a single Vue.js application.

## Features

*   **Decentralized Storage with Irys**: Upload files to a permanent, decentralized storage network.
*   **Cross-Chain Messaging with LayerZero**: Send messages between different blockchain testnets.
*   **Token-Gated Content with Lit Protocol**: Encrypt and decrypt content based on the ownership of a specific NFT.

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/)
*   [MetaMask](https://metamask.io/) browser extension

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/J2R5M3/aveum.git
    cd aveum
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

### Configuration

1.  **Create a `.env` file** in the root of the project if it doesn't exist.

2.  **Add your testnet private key** to the `.env` file. This key will be used to pay for transactions on the testnets.

    ```
    VITE_PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY
    ```

    **IMPORTANT**: For your security, please make sure this is a new, throwaway account that does not hold any real funds.

## Usage

1.  **Run the development server:**

    ```bash
    npm run dev
    ```

2.  **Open your browser** and navigate to the local URL provided (usually `http://localhost:5173`).

3.  **Use the application:**
    *   **Irys Uploader**: Select a file and click "Upload" to upload it to the Irys devnet.
    *   **LayerZero Messenger**: Connect your wallet, enter a destination endpoint ID and a message, and click "Send Message".
    *   **Lit Protocol Token Gated Content**: Enter a secret message, encrypt it, and then decrypt it if you own the required NFT.

## Smart Contract Deployment

The LayerZero integration requires a smart contract to be deployed to two different testnets. For instructions on how to compile and deploy the `SimpleOApp` contract, please see the `README.md` file in the `contracts` directory.
