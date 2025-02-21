<template>
  <span class="flow-node-icon">
    <component :is="icon" style="width: 100%;height: 100%;"/>
  </span>
</template>

<script setup lang="ts">
import { type Component,computed,withDefaults} from 'vue';

const props = withDefaults(defineProps<{
  icon: Component,
  size?: number
}>(), {
  size: 30
})
const iconSize = computed(() => `${props.size}px`)
</script>

<style scoped lang="less">
.flow-node-icon{
  width: v-bind(iconSize);
  height: v-bind(iconSize)
}
</style>
