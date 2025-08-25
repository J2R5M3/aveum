<template>
  <div class="audio-player">
    <h2>Token-Gated Audio Player</h2>
    <div class="input-group">
      <input v-model="contractAddress" placeholder="NFT Contract Address" />
      <input v-model="tokenId" placeholder="Token ID" />
      <button @click="loadAndDecryptAudio" :disabled="loading">
        {{ loading ? 'Loading...' : 'Load Audio' }}
      </button>
    </div>
    <div v-if="audioSrc" class="audio-container">
      <audio controls :src="audioSrc"></audio>
    </div>
    <div v-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ethers } from 'ethers';
import * as LitJsSdk from '@lit-protocol/sdk-browser';
import { Buffer } from 'buffer';

const contractAddress = ref('');
const tokenId = ref('');
const loading = ref(false);
const audioSrc = ref<string | null>(null);
const error = ref<string | null>(null);

// Placeholder ABI for tokenURI function
const contractABI = [
  "function tokenURI(uint256 tokenId) view returns (string memory)",
];

const loadAndDecryptAudio = async () => {
  if (!contractAddress.value || !tokenId.value) {
    error.value = 'Please provide a contract address and token ID.';
    return;
  }

  loading.value = true;
  audioSrc.value = null;
  error.value = null;

  try {
    // 1. Fetch metadata from the NFT
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.value, contractABI, provider);
    const tokenURI = await contract.tokenURI(tokenId.value);

    const metadataBase64 = tokenURI.split('data:application/json;base64,')[1];
    const metadataString = Buffer.from(metadataBase64, 'base64').toString();
    const metadata = JSON.parse(metadataString);

    const irysTxId = metadata.animation_url.split('ar://')[1];
    const encryptedSymmetricKey = metadata.properties.encrypted_symmetric_key;

    // 2. Download encrypted file from Irys
    const irysUrl = `https://gateway.irys.xyz/${irysTxId}`;
    const encryptedFileResponse = await fetch(irysUrl);
    if (!encryptedFileResponse.ok) throw new Error('Failed to fetch file from Irys');
    const encryptedFile = await encryptedFileResponse.blob();

    // 3. Decrypt the file with Lit Protocol
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'cayenne' });
    await litNodeClient.connect();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'sepolia' });

    // Note: The accessControlConditions are not needed here for decryption.
    // They are retrieved by the Lit nodes from the on-chain storage where the key was saved.
    const symmetricKey = await litNodeClient.getEncryptionKey({
        // accessControlConditions are implicitly fetched by the nodes
        toDecrypt: encryptedSymmetricKey,
        chain: 'sepolia',
        authSig,
    });

    const decryptedFile = await LitJsSdk.decryptFile({
        file: encryptedFile,
        symmetricKey,
    });

    // 4. Create a blob URL and play the audio
    const decryptedFileBlob = new Blob([decryptedFile], { type: encryptedFile.type });
    audioSrc.value = URL.createObjectURL(decryptedFileBlob);

  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.audio-player {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.audio-container {
  margin-top: 20px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
