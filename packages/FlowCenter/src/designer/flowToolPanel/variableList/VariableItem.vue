<script lang="ts" setup>
import type { FlowVariables } from '../../../types'
import { getItemType } from '../../../common/resolveDs'
import useDesignerStore from '../../useDesignerStore'
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
const props = withDefaults(
  defineProps<{
    item: FlowVariables
    showOpt?: boolean
  }>(),
  {
    item: () => ({
      dataType: { type: 'string' },
      description: '',
      name: '',
      variableType: 'page'
    }),
    showOpt: true
  }
)
const { state, delVariable } = useDesignerStore()
const emits = defineEmits(['triggerItemClick'])
const editVariable = (item: any) => {
  state.editVarRow = item
  state.createVariable = true
}
// 判断如果是服务结构体类型，则不允许删除
const deleteVariable = (item: any) => {
  // if (item?.dataType?.type === 'structureObject') {
  //   message.warning('服务节点结构体变量不允许手动删除(仅会随着服务节点删除而删除)');
  //   return;
  // }
  // TODO:引用获取
  Modal.confirm({
    title: '确定删除变量吗？',
    onOk() {
      delVariable(item?.id)
    }
  })
}
</script>
<template>
  <div @click="$emit('triggerItemClick', item)" class="variable-item flex cursor-pointer leading-20px px-1 py-1">
    <span :title="`${item.name}(${getItemType(item.dataType)})`" style="" class="flex-1 overflow-hidden-one">
      <span>{{ item.name }}</span>
      <span class="ml-2 font-italic" style="color: var(--ant-colorTextTertiary)">
        {{ getItemType(item.dataType) }}
      </span>
    </span>
    <span v-if="showOpt" class="flex items-center operation invisible ml-3 shrink-0">
      <EditOutlined style="color: #999" class="cursor-pointer" @click.stop="editVariable(item)" />
      <DeleteOutlined style="color: #999" class="ml-1 cursor-pointer" @click.stop="deleteVariable(item)" />
    </span>
  </div>
</template>
<style scoped lang="less">
.variable-item:hover {
  background-color: var(--ant-colorFillTertiary);
  .operation {
    visibility: visible;
  }
}
</style>
