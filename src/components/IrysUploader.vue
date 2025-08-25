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
import { Uploader } from '@irys/upload';
import { Ethereum }from '@irys/upload-ethereum';

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
  const privateKey = import.meta.env.VITE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('VITE_PRIVATE_KEY is not set in .env file');
  }

  const irysUploader = await Uploader(Ethereum).withWallet(privateKey).devnet();
  return irysUploader;
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
  } catch (e: any) {
    error.value = e.message;
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
