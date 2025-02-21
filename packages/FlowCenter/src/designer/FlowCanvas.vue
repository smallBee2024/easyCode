<template>
  <div class="flow-canvas-bg">
    <div class="flow-canvas-scale-inner" :style="{ transform: `scale(${scale})` }">
      <div class="flow-canvas-content">
        <FlowNodeChildren :nodes="nodes" />
      </div>
    </div>
  </div>
  <FlowNodeSetter/>
</template>

<script setup lang="ts">
import { type Flow } from '../types'
import { computed } from 'vue'
import FlowNodeSetter from './FlowNodeSetter.vue'
import FlowNodeChildren from './FlowNodeChildren.vue'
const props = defineProps<{
  data?: Flow,
  zoom?: number
}>()

const nodes = computed(() => props.data?.children || [])
const scale = computed(() => props.zoom/100)
</script>

<style scoped lang="less">

.flow-canvas-bg {
  background: #F7F7F7
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAKKADAAQAAAABAAAAKAAAAABZLkSWAAAAR0lEQVRYCe3QQQ0AIAwAsYF/BXtjAIUQHvMwkp6CSyNEgAABAgQIECBAgAABAgQIECBAgAABAgQI/Ckwum7n2ue9za6D9XUBBeUC8oQjgoIAAAAASUVORK5CYII=)
    repeat scroll;
  background-size: 20px 20px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
}

.flow-canvas-scale-inner {
  transform-origin: 50% 0 0;
  transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
    -webkit-transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.flow-canvas-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 55px 20px;
  min-width: 100%;
}
</style>
