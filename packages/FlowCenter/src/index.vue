<template>
  <div class="xx-wrapper">
    <!-- v-if="currentFlow" -->
    <FlowDesigner
      :materials="materials"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import FlowDesigner from './designer/index.vue'
  import { nodes as materials } from './materials'


</script>

<style scoped lang="less"></style>
