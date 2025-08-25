<script setup lang="ts">
import IrysUploader from '../components/IrysUploader.vue'
import LayerZeroMessenger from '../components/LayerZeroMessenger.vue'
import LitTokenGated from '../components/LitTokenGated.vue'
</script>

<template>
  <main>
    <h1>Vue.js + Irys + LayerZero + Lit Protocol</h1>
    <p>
      This is a demo application that showcases the integration of Irys, LayerZero, and Lit Protocol in a Vue.js application.
    </p>
    <div class="component-wrapper">
      <IrysUploader />
    </div>
    <div class="component-wrapper">
      <LayerZeroMessenger />
    </div>
    <div class="component-wrapper">
      <LitTokenGated />
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.component-wrapper {
  width: 100%;
}
</style>
