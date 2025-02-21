<template>
  <div class="flow-node-handler-wrapper" :class="{'hide-arrow': hideArrow}" @click.stop>
    <a-popover placement="right" :arrow="{ pointAtCenter: true }" :get-popup-container="el => el.parentElement">
      <template #content>
        <div class="flow-add-nodes">
          <div v-for="(item, key) in materials" :key="key" class="flow-add-nodes-group">
            <div class="flow-add-nodes-group-title">{{ key }}</div>
            <div class="flow-add-nodes-group-content">
              <div v-for="node in item.children" :key="node.type" class="flow-add-node-item"
                @click.stop="handleAddNode(node)">
                <div class="flow-add-node-icon">
                  <FlowNodeIcon :icon="node.icon" />
                </div>
                {{ node.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="flow-node-handler">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20"
          height="20">
          <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" fill="currentColor"></path>
          <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" fill="currentColor"></path>
        </svg>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { Popover as APopover } from 'ant-design-vue'
import useDesignerStore from './useDesignerStore';
import { computed } from 'vue';
import { groupBy } from '../common/helper';
import { type FlowMaterial } from '../types';
import FlowNodeIcon from './FlowNodeIcon.vue';
const props = withDefaults(defineProps<{
  hideArrow?: boolean
}>(), {
  hideArrow: false
})
const { state } = useDesignerStore();
const theme = computed(() => state.theme);
const materials = computed(() => {
  const materials = Object.values(state.materials).filter(item => !item.config?.hideInAdd);
  return groupBy(materials, 'group');
});
const emit = defineEmits<{
  add: [node: FlowMaterial]
}>()
function handleAddNode(node: FlowMaterial) {
  emit('add', node)
}


</script>

<style scoped lang="less">
.flow-node-handler-wrapper {
  height: 70px;
  width: 40px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  justify-content: center;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #dedede;
  }

  &:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    left: 50%;
    margin-left: -8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #dedede;
  }
  &.hide-arrow:after {
    display: none;
  }
  .flow-node-handler {
    width: 26px;
    height: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: v-bind(theme);
    position: relative;
    z-index: 1;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: transform 0.3s ease;
    margin-top: -10px;
    visibility: hidden;
    transform: scale(0);
  }

  &:hover .flow-node-handler {
    transform: scale(1) !important;
    visibility: visible !important;

    .icon {
      display: block !important;
    }
  }
}

.flow-add-nodes {
  width: 300px;
  max-height: 600px;
  overflow-y: auto;
}

.flow-add-nodes-group {
  margin-bottom: 16px;

  .flow-add-nodes-group-title {
    font-size: 12px;
    color: #999;
    margin-bottom: 6px;
  }

  .flow-add-nodes-group-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .flow-add-node-item {
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      flex: 0 0 calc(50% - 4px);
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        border-color: v-bind(theme);
        color: v-bind(theme);
      }
    }

    .flow-add-node-icon {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
  }
}
</style>
