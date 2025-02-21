<template>
  <a-drawer :bodyStyle="{ padding: '10px 0' }" v-model:open="open" :width="700" placement="right" @close="handleClose">
    <template #title>
      <AFlex align="center" gap="small">
        <FlowNodeIcon :icon="icon" :size="24" />
        {{ editNodeTypeName }}
      </AFlex>
    </template>

    <AForm ref="formRef" class="flow-node-setter" :model="cloneNodeData" layout="vertical">
      <div class="flow-node-setter-body">
        <template v-if="!state.setterProps.hideBaseInfo">
          <ARow :gutter="10">
            <ACol :span="12">
              <AFormItem
                class="normal-label"
                name="name"
                label="节点名称"
                :rules="[{ required: true, message: '节点名称是必填字段' }]"
              >
                <AInput placeholder="请输入" v-model:value="cloneNodeData.name" :disabled="isNameEnableInput"></AInput>
              </AFormItem>
            </ACol>
            <ACol :span="12">
              <AFormItem class="normal-label" name="id" label="编码">
                <AInput :value="cloneNodeData.id" disabled></AInput>
              </AFormItem>
            </ACol>
          </ARow>
          <AFormItem class="normal-label" name="description" label="描述">
            <ATextarea
              placeholder="请输入节点描述"
              :maxlength="200"
              show-count
              v-model:value="cloneNodeData.description"
            ></ATextarea>
          </AFormItem>
          <ADivider class="small" />
        </template>
        <!-- 传入全量节点配置，分支节点更新需要用到 -->
        <div v-if="setterComponent">
          <component
            :is="setterComponent"
            v-model:node="cloneNodeData"
            v-model:value="cloneNodeData.props"
            :node-info="materialInfo"
          />
        </div>
      </div>
    </AForm>
    <template #footer>
      <AFlex class="flow-node-setter-footer" gap="middle">
        <AButton type="primary" @click="handleSave">保存</AButton>
        <AButton @click="handleClose">取消</AButton>
      </AFlex>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, watch, ref, inject } from 'vue'

import {
  type FormInstance,
  message
} from 'ant-design-vue'
import useDesignerStore from './useDesignerStore'
import { type FlowNode } from '../types'
import { cloneDeep } from 'lodash-es'
import FlowNodeIcon from './FlowNodeIcon.vue'
const { state, setEditNode, callChangeHooks } = useDesignerStore()
const formRef = ref<FormInstance>()
const open = computed(() => !!state.editNode)
// 兼容单个分支节点选中
const data = computed(() => {
  return state.editNode || ({} as FlowNode)
})

const materialInfo = computed(() => state.materials[data.value.type])
const setterComponent = computed(() => materialInfo.value?.setter ?? null)
const icon = computed(() => materialInfo.value?.icon)
const editNodeTypeName = computed(() => {
  if (materialInfo.value?.type === 'FlowStartNode') return '开始节点'
  return '节点配置'
})
const cloneNodeData = ref<FlowNode>()
const isNameEnableInput = computed(() => {
  return ['FlowStartNode'].includes(cloneNodeData.value.type)
})
const handleSave = async () => {
  try {
    await formRef.value.validateFields()
    // 调用节点配置的校验方法
    if (materialInfo.value.validator && typeof materialInfo.value.validator === 'function') {
      const { type, messages } = materialInfo.value.validator(cloneNodeData.value, state)
      if (type === 'error') {
        if (messages.length > 0) {
          message.error(messages[0])
          return
        }
      } else {
        // 提示文字修改
        if (materialInfo.value.updateValueText && typeof materialInfo.value.updateValueText === 'function') {
          materialInfo.value.updateValueText(cloneNodeData.value, state)
        }
      }
    }
    Object.assign(state.editNode, cloneNodeData.value)
    console.log(state.editNode);
    callChangeHooks('update', cloneNodeData.value)
    handleClose()
  } catch (err: any) {
    message.error(err.errorFields ? err.errorFields[0]?.errors[0] ?? '配置校验失败' : err)
  }
}
function handleClose() {
  setEditNode(null, null)
}
// 初始化深拷贝一份配置
watch(
  data,
  (val: any) => {
    if (val) {
      cloneNodeData.value = cloneDeep(val)
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style scoped lang="less">
.flow-node-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flow-node-setter {
  height: 100%;
  display: flex;
  flex-direction: column;

  .flow-node-setter-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden; // a-row会导致滚动条？？
  }
}
</style>
