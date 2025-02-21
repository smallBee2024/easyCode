<template>
  <div class="flow-node-outer" >
    <!-- 节点自定义样式 -->
    <component :is="nodeComponent" :data="data" v-if="isCustom" :index="index" :config="materialInfo?.config" />
    <!-- 默认样式 -->
    <div class="flow-node-wrapper"
      :class="{ selected: data.id === state.editNode?.id, autowidth: materialInfo?.config?.nodeAutoWidth, error: checkInfo?.type === 'error', warning: checkInfo?.type === 'warning' }"
      :id="data.id"
      v-else @click.stop>
      <div class="flow-node-toolbar">
        <a-popover title="配置错误" :get-popup-container="el => el.parentElement.parentElement"
          v-if="checkInfo?.type !== 'default'">
          <template #content>
            <p class="flow-node-error-message" v-for="item in checkInfo?.messages" :key="item">{{ item }}</p>
          </template>
          <AlertOutlined class="flow-node-toolbar-item"
            :class="{ error: checkInfo?.type === 'error', warning: checkInfo?.type === 'warning' }" />
        </a-popover>
        <EditOutlined class="flow-node-toolbar-item" v-if="allowEdit" @click="handleEditNode" />
        <a-popconfirm v-if="allowDelete" title="确定删除该节点？" ok-text="确定" cancel-text="取消" @confirm="handleDeleteNode"
          :get-popup-container="el => el.parentElement.parentElement" :overlayStyle="{ width: '160px' }"
          okType="danger">
          <DeleteOutlined class="flow-node-toolbar-item danger" />
        </a-popconfirm>
      </div>
      <div class="flow-node-box" @click.stop="handleEditNode">
        <div class="flow-node-title">
          <div class="flow-node-title-left">
            <FlowNodeIcon :icon="icon" />
            <span class="flow-node-name">{{ data.name }}</span>
          </div>
          <UpOutlined class="flow-node-collapse" :class="{ collapsed: collapsed }" @click.stop="handleCollapse"
            v-if="materialInfo?.config.allowCollapse" />
        </div>
        <div class="flow-node-content" :class="{ collapsed: collapsed }">
          <component :is="nodeComponent" :data="data" v-if="nodeComponent && !collapsed" :index="index"
            :config="materialInfo?.config" />
          <div class="flow-node-discription" v-else>{{ data.props.valueText || data.description || '无描述信息' }}</div>
        </div>
        <div class="flow-node-tips" v-if="materialInfo?.config.footerTips">{{ materialInfo?.config.footerTips }}</div>
      </div>
    </div>
    <FlowNodeHandler :hide-arrow="isLast" v-if="!isRootLast" @add="onAddNode" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FlowNodeIcon from './FlowNodeIcon.vue';
import FlowNodeHandler from './FlowNodeHandler.vue'
import useDesignerStore from './useDesignerStore';
import { type FlowMaterial, type FlowNode } from '../types';
import { AlertOutlined, DeleteOutlined, EditOutlined, UpOutlined } from '@ant-design/icons-vue';
import { Popconfirm as APopconfirm, Popover as APopover } from 'ant-design-vue'

const props = defineProps<{
  data: FlowNode,
  parentList: FlowNode[],
  index: number
}>()
const { state, setEditNode, addNode, removeNode } = useDesignerStore()
const materials = computed(() => state.materials)
const materialInfo = computed(() => materials.value[props.data.type])
const icon = computed(() => materialInfo.value?.icon)

const nodeComponent = computed(() => materialInfo.value?.noder)
const isCustom = computed(() => materialInfo.value?.config?.isCustom)
const theme = computed(() => state.theme)
const allowEdit = computed(() => materialInfo.value?.config?.allowEdit ?? true)
const allowDelete = computed(() => materialInfo.value?.config?.allowDelete ?? true)
const isLast = computed(() => props.index === props.parentList.length - 1);
const isRootLast = computed(() => props.data.id === state.flowData.children.slice(-1)[0]?.id); // 是否是根节点最后一个节点
const checkInfo = computed(() => state.validateInfo[props.data.id] || {type: 'default',messages: []})
function handleEditNode() {
  if (allowEdit.value) {
    setEditNode(props.data)
  }
}
function handleDeleteNode() {
  removeNode(props.index, props.parentList)
}
function onAddNode(material: FlowMaterial) {
  const node = addNode(material, props.index + 1, props.parentList)
  setEditNode(node)
}
const collapsed = ref(false)
function handleCollapse() {
  collapsed.value = !collapsed.value
}

</script>

<style scoped lang="less">
.flow-node-outer {
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover :deep(.flow-node-handler) {
    transform: scale(0.4);
    visibility: visible !important;

    .icon {
      display: none;
    }
  }


}

.flow-node-wrapper {
  position: relative;
  cursor: pointer;
  width: 220px;
  margin: 0 auto;
  &.node-flash>.flow-node-box {
    animation: flash 1s ease infinite;
  }
  &.autowidth {
    width: auto;
  }

  &:hover>.flow-node-toolbar {
    opacity: 1;
    top: -24px;
    transform: scale(1);
  }

  &.selected {
    &>.flow-node-box {
      border: 2px solid v-bind(theme) !important;
    }
  }

  &.error {
    &>.flow-node-box {
      border: 2px solid #FF5502;
    }
  }

  &.warning {
    &>.flow-node-box {
      border: 2px solid #FAAD14;
    }
  }
}

.flow-node-toolbar {
  position: absolute;
  top: -20px;
  right: 6px;
  // z-index: 2;
  cursor: pointer;
  opacity: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  transition: all .3s ease;
  transform: scale(0.8);

  .flow-node-toolbar-item {
    background: v-bind(theme);
    margin-left: 2px;
    padding: 4px;
    border-radius: 4px;
    color: #fff;

    &.error {
      background: #ff4d4f;
    }

    &.warning {
      background: #ff4d4f;
    }
  }

}

.flow-node-error-message {
  font-size: 12px;
}

.flow-node-box {
  min-height: 70px;
  border-radius: 8px;
  box-shadow: 0 0 4px 0 rgba(10, 30, 65, 0.16);
  background: #fff;
  padding: 10px;
  border: 2px solid transparent;
}

.flow-node-title {
  display: flex;
  align-items: center;
  border-radius: 6px 6px 0 0;
  user-select: none;
  justify-content: space-between;
  min-width: 196px;

  .flow-node-title-left {
    display: flex;
    align-items: center;
  }

  .flow-node-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flow-node-name {
    font-size: 14px;
    margin-left: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flow-node-collapse {
    color: #8C8C8C;
    transition: transform .5s ease;
    padding: 4px;

    &.collapsed {
      transform: rotate(180deg);
    }
  }
}

.flow-node-content {
  padding: 10px;
  margin-top: 10px;
  border-radius: 6px;
  min-width: 180px;
  background: #F7F7F7;
  font-size: 12px;
  line-height: 1.5;
  color: #777;
  opacity: 1;
  position: relative;
  z-index: 2;
  transform-origin: 50% 0;
  transform: scale(1);
  transition: all .5s ease;
  visibility: visible;

  .flow-node-discription {
    min-height: 18px;
  }

  &.collapsed {
    opacity: 0;
    width: 0;
    height: 0;
    transform: scale(0);
    visibility: hidden;
    padding: 0 10px;
  }


}

.flow-node-tips {
  color: #8C8C8C;
  padding-top: 8px;
  text-align: left;
  font-size: 12px;
}

@keyframes flash {

  from,
  50%,
  to {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0;
  }
}
</style>
