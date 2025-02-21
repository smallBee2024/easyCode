<template>
  <div class="start-node-config-wrapper">
    <AFormItem class="block-item" label="动作入参">
      <!-- <ActionInputParamsSet :value="value.inputs" /> -->
      <AInput v-model:value="value.inputs" />
    </AFormItem>
  </div>
</template>

<script setup lang="ts">
import { FlowStartNode } from './index'
import type { FlowNodeProps } from '../../types'
// import { ActionInputParamsSet } from '../toolComs'
const props = withDefaults(
  defineProps<{
    value: FlowNodeProps
  }>(),
  {
    value: () => FlowStartNode.props
  }
)
const emits = defineEmits(['update:value']);
</script>

<style scoped lang="less"></style>
