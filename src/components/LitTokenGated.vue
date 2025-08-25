<template>
  <div class="lit-token-gated">
    <h2>Lit Protocol Token Gated Content</h2>
    <div>
      <input v-model="secretMessage" placeholder="Enter a secret message" />
      <button @click="encryptMessage" :disabled="encrypting">
        {{ encrypting ? 'Encrypting...' : 'Encrypt Message' }}
      </button>
    </div>
    <div v-if="encryptedData">
      <h3>Encrypted Data</h3>
      <p>Ciphertext: {{ encryptedData.ciphertext }}</p>
      <p>Data to sign: {{ encryptedData.dataToSign }}</p>
      <hr />
      <h3>Access Control Conditions</h3>
      <pre>{{ JSON.stringify(accessControlConditions, null, 2) }}</pre>
      <hr />
      <button @click="decryptMessage" :disabled="decrypting">
        {{ decrypting ? 'Decrypting...' : 'Decrypt Message' }}
      </button>
      <p v-if="decryptedMessage">Decrypted message: {{ decryptedMessage }}</p>
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

const secretMessage = ref('This is a secret message!');
const encrypting = ref(false);
const decrypting = ref(false);
const encryptedData = ref<{ ciphertext: string; dataToSign: string } | null>(null);
const decryptedMessage = ref('');
const error = ref<string | null>(null);

let litNodeClient: any;

const accessControlConditions = [
  {
    contractAddress: '0x9fc8066443392b3b626b2b4940146627c49d9f51',
    standardContractType: 'ERC721',
    chain: 'optimismSepolia',
    method: 'balanceOf',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '>',
      value: '0',
    },
  },
];

onMounted(async () => {
  litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'cayenne' });
  await litNodeClient.connect();
  (window as any).litNodeClient = litNodeClient;
});

const encryptMessage = async () => {
  if (!secretMessage.value) return;
  encrypting.value = true;
  error.value = null;
  try {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'optimismSepolia' });
    const { ciphertext, dataToSign } = await LitJsSdk.encryptString(
      {
        accessControlConditions,
        chain: 'optimismSepolia',
        dataToEncrypt: secretMessage.value,
      },
      litNodeClient
    );
    encryptedData.value = { ciphertext, dataToSign };
  } catch (e: any) {
    error.value = e.message;
  } finally {
    encrypting.value = false;
  }
};

const decryptMessage = async () => {
  if (!encryptedData.value) return;
  decrypting.value = true;
  error.value = null;
  try {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'optimismSepolia' });
    const decryptedString = await LitJsSdk.decryptToString(
      {
        accessControlConditions,
        chain: 'optimismSepolia',
        ciphertext: encryptedData.value.ciphertext,
        dataToSign: encryptedData.value.dataToSign,
      },
      litNodeClient
    );
    decryptedMessage.value = decryptedString;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    decrypting.value = false;
  }
};
</script>

<style scoped>
.lit-token-gated {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
pre {
  white-space: pre-wrap;
}
</style>
