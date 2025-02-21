<template>
  <div class="logic-flow-designer" ref="logicFlowDesignerRef">

    <div class="logic-flow-toolbar" v-if="toolbar">
      <div class="left-toolbar">
        <a-space>
          <a-tooltip title="变量设置" placement="bottom">
            <!-- <IconFont @click="showToolPanel = true" type="icon-var-prop" size="16" style="position: relative;top:1px" /> -->
          </a-tooltip>
        </a-space>
        <ADivider type="vertical" />
        <a-space>
          <LeftCircleOutlined class="action-icon" :class="{ disabled: !canUndo }" @click="designerStore.history.undo" />
          <RightCircleOutlined class="action-icon" :class="{ disabled: !canRedo }"
            @click="designerStore.history.redo" />
        </a-space>
        <ADivider type="vertical" />
        <a-space>
          <MinusCircleOutlined class="action-icon" @click="designerStore.zoomOut" />
          <span size="small" class="flow-zoom" @click="designerStore.zoomReset">{{ designerStore.state.zoom }}%</span>
          <PlusCircleOutlined class="action-icon" @click="designerStore.zoomIn" />
          <FullscreenExitOutlined v-if="isFullscreen" class="action-icon" @click="exit" />
          <FullscreenOutlined v-else class="action-icon" @click="enter" />
        </a-space>
        <slot name="toolbar-left"></slot>
      </div>
      <div class="right-toolbar">
        <slot name="toolbar-right"> </slot>
        <div class="flow-check-info" @click="openErrPanel">
          校验结果：
          <a-badge :count="validateInfoFlat.length" v-if="validateInfoFlat.length"></a-badge>
          <CheckCircleOutlined :style="{ color: '#87D068', fontSize: '16px' }" v-else />
        </div>
      </div>
    </div>
    <div class="logic-flow-canvas">
      <FlowCanvas v-model:data="designerStore.state.flowData" :zoom="designerStore.state.zoom" />
      <!-- 变量设置面板 -->
      <FlowToolPanel v-model:visible="showToolPanel" type="var" />
      <!-- 错误信息面板 -->
      <div class="flow-error-panel" :class="{ show: showErrPanel }">
        <div class="flow-error-panel-body">
          <a-table :dataSource="errorTableData" :columns="errorTableColumns" size="small" bordered :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'type'">
                <a-tag color="error" v-if="record.type === 'error'">错误</a-tag>
                <a-tag color="warning" v-else>警告</a-tag>
              </template>
              <template v-if="column.dataIndex === 'position'">
                <a-tooltip title="点击定位到节点">
                  <div style="color: #1777FF;cursor: pointer;" @click="handlePositionError(record.position)">
                    <AimOutlined /> {{ record.position.name }} ({{ record.position.id }})
                  </div>
                </a-tooltip>
              </template>
            </template>
          </a-table>
        </div>
        <div class="flow-error-panel-footer" @click="closeErrPanel">
          <UpOutlined />
        </div>
      </div>
    </div>

    <!-- 一些全局弹框:这里主要导入的是一些store弹框 -->
    <!-- <CreateVariables /> -->

  </div>
</template>

<script setup lang="ts">
import { type Flow, type FlowMaterialMap, type FlowVariables, type ValidateInfo } from '../types';
import useAntdCssVar from './useAntdCssVar'
import { Divider as ADivider, Space as ASpace, Tooltip as ATooltip, Badge as ABadge } from 'ant-design-vue';
import { LeftCircleOutlined, RightCircleOutlined, FullscreenOutlined, FullscreenExitOutlined, MinusCircleOutlined, PlusCircleOutlined, CheckCircleOutlined, UpOutlined, AimOutlined } from '@ant-design/icons-vue';
import FlowCanvas from './FlowCanvas.vue'
// import { IconFont } from '../materials/resource/components'
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'
import useDesignerStore from './useDesignerStore'
import FlowToolPanel from './flowToolPanel/index.vue'
import { designerStoreInjectKey, modeInjectKey, themeInjectKey } from './injectKeys';
import { useFullscreen } from '@vueuse/core'
// import { CreateVariables } from '../materials/resource/components/store'
defineOptions({
  name: 'LogicFlowDesigner'
})
export interface Props {
  materials: FlowMaterialMap,
  data?: Flow,
  mode?: 'edit' | 'preview',
  toolbar?: boolean,
  theme?: string,
  storesVariables?: FlowVariables[]
}
const props = withDefaults(defineProps<Props>(), {
  materials: () => ({}),
  mode: 'edit',
  toolbar: true,
  theme: '#0089FF',
  storesVariables: () => []
})
const emits = defineEmits(['change'])
const showToolPanel = ref(false);
// antd 变量初始化
useAntdCssVar();

const designerStore = useDesignerStore()
designerStore.setMaterials(props.materials)
designerStore.setMode(props.mode)
designerStore.setTheme(props.theme)
designerStore.onChange((type, data, flow) => {
  console.log('change', type, data, flow);
  emits('change', type, data, flow)
})
watch(() => props.storesVariables, (storesVariables) => {
  designerStore.setstoresVariables(storesVariables)
}, {
  immediate: true
})
provide(themeInjectKey, computed(() => designerStore.state.theme))
provide(modeInjectKey, computed(() => designerStore.state.mode))
provide(designerStoreInjectKey, designerStore)
const canUndo = computed(() => designerStore.history.canUndo.value)
const canRedo = computed(() => designerStore.history.canRedo.value)
const logicFlowDesignerRef = ref()
const { isFullscreen, enter, exit } = useFullscreen(logicFlowDesignerRef)
onBeforeUnmount(designerStore.destroy)
watch(() => props.data?.id, () => {
  designerStore.changeFlow(props.data)
}, {
  immediate: true
})
const validateInfoFlat = computed(() => {
  let result: ValidateInfo[] = [];
  Object.entries(designerStore.state.validateInfo).forEach(([id, info]) => {
    const { type, messages, children } = info
    if (children) {
      children.forEach(child => {
        result.push({
          type: child.type,
          id: child.id,
          messages: child.messages
        })
      })
    } else {
      result.push({
        type,
        id,
        messages
      })
    }
  })
  return result
}
)
const errorTableColumns = [
  {
    title: '位置',
    dataIndex: 'position',
    width: '400px'
  },
  {
    title: '错误类型',
    dataIndex: 'type',
    width: '100px',
    align: 'center'
  },
  {
    title: '详细信息',
    dataIndex: 'messages',
  }
]
const errorTableData = ref([])
const showErrPanel = ref(false)
function openErrPanel() {
  const dataSource = []
  const nodesMap = designerStore.getFlatFlowNodes()
  validateInfoFlat.value.forEach(item => {
    const node = nodesMap[item.id]
    dataSource.push({
      type: item.type,
      position: {
        name: node.name,
        id: node.id,
      },
      messages: item.messages.join('; ')
    })
  })
  errorTableData.value = dataSource
  showErrPanel.value = true
}
function closeErrPanel() {
  errorTableData.value = []
  showErrPanel.value = false
}
function handlePositionError(position: {
  name: string,
  id: string
}) {
  const nodeElement = document.getElementById(`${position.id}`)
  // 滚动到视图内
  nodeElement?.scrollIntoView({
    behavior: 'smooth', // 平滑滚动 (可选)
    block: 'center'      // 垂直方向对齐方式 ('start', 'center', 'end', or 'nearest')
  });
  nodeElement.classList.add('node-flash');
  setTimeout(() => {
    nodeElement.classList.remove('node-flash');
  }, 1500);
}
defineExpose({
  getData() {
    return designerStore.state.flowData
  },
  validate: designerStore.validate,
})

</script>

<style scoped lang="less">
.logic-flow-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logic-flow-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f2f2f3;
  border-bottom: 1px solid #dadadd;
  padding: 4px 10px;
  line-height: 24px;

  .action-icon {
    color: #3e3e3c;
    cursor: pointer;

    &.disabled {
      opacity: 0.4;
    }
  }

  .flow-zoom {
    color: #3E3E3C;
    font-size: 12px;
  }

  .left-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .right-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .flow-check-info {
    display: flex;
    align-items: center;
    color: #AAAAAA;
    font-size: 12px;
    cursor: pointer;
  }

  .flow-error {
    color: red;
    background: red;
  }
}

.logic-flow-canvas {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.flow-error-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  max-height: 0;
  background: #fff;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  padding-bottom: 0;
  visibility: hidden;

  &.show {
    max-height: 300px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    padding-bottom: 20px;
    visibility: visible;
  }

  .flow-error-panel-body {
    padding: 5px;
    max-height: 270px;
    overflow-y: auto;
  }

  .flow-error-panel-footer {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 80px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #F2F2F3;
    border-radius: 4px 4px 0 0;
    transform: translateX(-50%);
    cursor: pointer;
  }
}
</style>
