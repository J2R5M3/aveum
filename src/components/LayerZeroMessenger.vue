<template>
  <div class="layerzero-messenger">
    <h2>LayerZero Messenger</h2>
    <div class="warning">
      <p>
        <strong>Note:</strong> This component requires you to deploy the `SimpleOApp` smart contract to two testnets and update the `contractAddress` in the script.
      </p>
      <p>
        See the instructions in `contracts/README.md`.
      </p>
    </div>
    <div v-if="!isConnected">
      <button @click="connectWallet">Connect Wallet</button>
    </div>
    <div v-else>
      <p>Connected account: {{ account }}</p>
      <hr />
      <div>
        <h3>Send a Message</h3>
        <input v-model="destinationEid" placeholder="Destination Endpoint ID" />
        <input v-model="messageToSend" placeholder="Message" />
        <button @click="sendMessage" :disabled="sending">
          {{ sending ? 'Sending...' : 'Send Message' }}
        </button>
      </div>
      <hr />
      <div>
        <h3>Received Message</h3>
        <button @click="fetchMessage" :disabled="fetching">
          {{ fetching ? 'Fetching...' : 'Fetch Last Message' }}
        </button>
        <p v-if="receivedMessage">Last message: {{ receivedMessage }}</p>
      </div>
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';

// IMPORTANT: Replace with your deployed contract address
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_dstEid",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "message",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const isConnected = ref(false);
const account = ref<string | null>(null);
const destinationEid = ref('');
const messageToSend = ref('');
const sending = ref(false);
const fetching = ref(false);
const receivedMessage = ref('');
const error = ref<string | null>(null);

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

onMounted(async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      isConnected.value = true;
      account.value = accounts[0];
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
    }
  }
});

const connectWallet = async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        isConnected.value = true;
        account.value = accounts[0];
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
      }
    } catch (e: unknown) {
      error.value = (e as Error).message;
    }
  }
};

const sendMessage = async () => {
  if (!contract || !signer) return;
  sending.value = true;
  error.value = null;
  try {
    const fee = ethers.utils.parseEther('0.01'); // Placeholder fee
    const tx = await contract.sendMessage(
      destinationEid.value,
      messageToSend.value,
      { value: fee }
    );
    await tx.wait();
    alert('Message sent!');
  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    sending.value = false;
  }
};

const fetchMessage = async () => {
  if (!contract) return;
  fetching.value = true;
  error.value = null;
  try {
    const message = await contract.message();
    receivedMessage.value = message;
  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    fetching.value = false;
  }
};
</script>

<style scoped>
.layerzero-messenger {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}
</style>
