<template>
  <div class="audio-nft-minter">
    <h2>Audio NFT Minter</h2>
    <input type="file" @change="onFileSelected" accept="audio/*" />
    <button @click="processAndMint" :disabled="!file || processing">
      {{ processing ? 'Processing...' : 'Encrypt, Upload, and Mint' }}
    </button>
    <div v-if="irysTxId">
      <p>Upload successful!</p>
      <a :href="`https://devnet.irys.xyz/${irysTxId}`" target="_blank">View on Irys</a>
    </div>
    <div v-if="nftTxId">
      <p>NFT Minted!</p>
      <a :href="`https://sepolia.etherscan.io/tx/${nftTxId}`" target="_blank">View on Etherscan</a>
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WebIrys } from '@irys/sdk';
import { ethers } from 'ethers';
import * as LitJsSdk from '@lit-protocol/sdk-browser';
import { Buffer } from 'buffer';

const file = ref<File | null>(null);
const processing = ref(false);
const irysTxId = ref<string | null>(null);
const nftTxId = ref<string | null>(null);
const error = ref<string | null>(null);

// TODO: Replace with deployed contract address and ABI
const contractAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
const contractABI = [ // Placeholder ABI
  "function safeMint(address to, string memory uri) public"
];

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

const getIrys = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const network = 'devnet';
  const token = 'ethereum';
  const wallet = { name: 'ethersv5', provider: provider };

  const webIrys = new WebIrys({ network, token, wallet });
  await webIrys.ready();
  return webIrys;
};

const processAndMint = async () => {
  if (!file.value) {
    return;
  }

  processing.value = true;
  irysTxId.value = null;
  nftTxId.value = null;
  error.value = null;

  try {
    // 1. Encrypt the audio file with Lit Protocol
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'cayenne' });
    await litNodeClient.connect();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'sepolia' });

    const accessControlConditions = [
      {
        contractAddress: contractAddress,
        standardContractType: 'ERC721',
        chain: 'sepolia',
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ];

    const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({
        file: file.value,
    });

    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain: 'sepolia',
    });

    const encryptedFileBlob = new Blob([encryptedFile], { type: file.value.type });
    const encryptedFileForUpload = new File([encryptedFileBlob], file.value.name, { type: file.value.type });


    // 2. Upload the encrypted file to Irys
    const irys = await getIrys();
    const receipt = await irys.uploadFile(encryptedFileForUpload);
    irysTxId.value = receipt.id;

    // 3. Mint the NFT
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const metadata = {
      name: file.value.name,
      description: 'An audio NFT with token-gated access control.',
      image: 'https://via.placeholder.com/150', // Placeholder image
      animation_url: `ar://${irysTxId.value}`,
      properties: {
        encrypted_symmetric_key: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
      }
    };

    const metadataString = JSON.stringify(metadata);
    const metadataBase64 = Buffer.from(metadataString).toString('base64');
    const tokenURI = `data:application/json;base64,${metadataBase64}`;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.safeMint(userAddress, tokenURI);
    await tx.wait();
    nftTxId.value = tx.hash;

  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
.audio-nft-minter {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
