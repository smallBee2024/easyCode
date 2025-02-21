<template>
  <div class="flow-center-wrapper">
    <FlowDesigner />
  </div>
</template>

<script setup lang="ts">
  // import { ref } from 'vue';
  import { FlowCenter, FlowDesigner } from 'flowcenter';
</script>

<style scoped lang="less">
.flow-center-wrapper {
  width: 100%;
  height: 100%;
  background-color: aquamarine;
}
</style>
