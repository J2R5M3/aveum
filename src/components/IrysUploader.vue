<template>
  <div class="irys-uploader">
    <h2>Irys Uploader</h2>
    <input type="file" @change="onFileSelected" />
    <button @click="uploadFile" :disabled="!file || uploading">
      {{ uploading ? 'Uploading...' : 'Upload' }}
    </button>
    <div v-if="txId">
      <p>Upload successful!</p>
      <a :href="`https://devnet.irys.xyz/${txId}`" target="_blank">View on Irys</a>
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

const file = ref<File | null>(null);
const uploading = ref(false);
const txId = ref<string | null>(null);
const error = ref<string | null>(null);

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

const uploadFile = async () => {
  if (!file.value) {
    return;
  }

  uploading.value = true;
  txId.value = null;
  error.value = null;

  try {
    const irys = await getIrys();
    const receipt = await irys.uploadFile(file.value);
    txId.value = receipt.id;
  } catch (e: unknown) {
    error.value = (e as Error).message;
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.irys-uploader {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
