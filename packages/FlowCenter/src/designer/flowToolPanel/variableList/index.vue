<!--
 * @Author: Anxure
 * @Desc: 变量列表
 * @Date: 2024-07-31 11:13:44
 * @LastEditors: Anxure
 * @LastEditTime: 2024-07-31 18:15:11
-->
<script lang="ts" setup>
import { ref, computed, reactive } from 'vue'
import { Collapse } from 'vue-collapsed'
import { groupBy } from 'lodash-es'
import useDesignerStore from '../../useDesignerStore'
import { getItemType } from '../../../common/resolveDs'
import VariableItem from './VariableItem.vue'
import { DownOutlined, CloseOutlined } from '@ant-design/icons-vue'
// import { StructureTypeCheck } from '#flow-design/design/configComs/toolComs';
const { state } = useDesignerStore()
const searchText = ref('')
const detailRow = ref()
const handleAddVariable = () => {
  state.createVariable = true
}
const modalVisible = ref(false)
// 获取变量
const variableList = computed(() => {
  const variables = state.flowData?.variables ?? []
  const storesVars = state.storesVariables ?? []
  return [...variables,...storesVars]
})

// 按照类型分组
const variableFlatted = computed(() => {
  return groupBy(variableList.value, 'variableType')
})
// 全局变量
const storesVars = computed(() => {
  return variableFlatted.value['stores'] || []
})
// 页面变量
const pageVars = computed(() => {
  return variableFlatted.value['page'] || []
})
// 动作入参变量
const inputVars = computed(() => {
  return variableFlatted.value['input'] || []
})
// 流程中间变量
const flowTempVars = computed(() => {
  return variableFlatted.value['flowTemp'] || []
})
const expandFlagMap = reactive({
  stores: false,
  page: false,
  flowTemp: false,
  input: false
})
const variableGroup = computed(() => [
  {
    title: '全局变量',
    children: storesVars.value,
    key: 'stores',
    canIedit: false,
    canIdel: false
  },
  {
    title: '页面变量',
    children: pageVars.value,
    key: 'page',
    canIedit: false,
    canIdel: false
  },
  {
    title: '流程中间变量',
    children: flowTempVars.value,
    key: 'flowTemp',
    canIedit: true,
    canIdel: true
  }
])
// 是否显示更多类型查看
const showCheckModal = computed(() => {
  return ['structureObject'].includes(detailRow.value?.dataType?.type)
})
// 搜索后的列表(一维)
const searchedList = computed(() => {
  if (searchText.value) {
    return variableList.value.filter((item: any) => {
      return item.name.includes(searchText.value)
    })
  }
  return []
})
const handleShowDetail = (item: any) => {
  detailRow.value = item
}
</script>

<template>
  <a-flex vertical class="h-full px-2 pt-4 relative">
    <AButton type="primary" class="mb-2 w-full" @click="handleAddVariable"> 新增中间变量 </AButton>
    <AInputSearch v-model:value="searchText" placeholder="搜索" style="width: 100%" allow-clear />
    <template v-if="!searchText">
      <div v-for="group in variableGroup" :key="group.key">
        <template v-if="group.children.length > 0">
          <div class="cursor-pointer py-8px" @click="expandFlagMap[group.key] = !expandFlagMap[group.key]">
            <down-outlined :class="['switcher-icon', !expandFlagMap[group.key] && 'expand']" />
            {{ group.title }}
          </div>
          <Collapse as="section" :when="expandFlagMap[group.key]">
            <div class="pl-3">
              <VariableItem
                v-for="item in group.children"
                :key="item.name"
                @trigger-item-click="handleShowDetail"
                :showOpt="item.variableType === 'flowTemp'"
                :item="item"
              />
            </div>
          </Collapse>
        </template>
      </div>
    </template>
    <!-- 搜索列表 -->
    <div class="search-list-wrapper mt-2 flex-1 overflow-y-auto" v-else>
      <div class="pl-3" v-if="searchedList.length > 0">
        <VariableItem
          v-for="item in searchedList"
          :key="item.name"
          :item="item"
          @trigger-item-click="handleShowDetail"
        />
      </div>
      <s-empty v-else></s-empty>
    </div>
    <!-- 底部详情显示 -->
    <Transition name="fade">
      <div v-if="!!detailRow" class="detail-info-wrapper">
        <a-flex justify="space-between" align="center" class="title">
          <span>{{ detailRow.name }}</span>
          <CloseOutlined @click="detailRow = undefined"/>
        </a-flex>
        <a-flex class="attr-item-wrapper leading-40px">
          <span>变量名称</span>
          <span class="px-4 overflow-hidden-one flex-1 text-left" :title="detailRow.name">
            {{ detailRow.name }}
          </span>
        </a-flex>
        <a-flex class="attr-item-wrapper leading-40px">
          <span>变量类型</span>
          <a-flex justify="space-between" align="center" class="flex-1 px-4 min-w-0">
            <span :title="detailRow?.typeInfo?.type || detailRow?.dataType?.type" class="overflow-hidden-one text-left">
              {{ getItemType(detailRow?.typeInfo || detailRow?.dataType) }}
            </span>
            <a class="shrink-0" v-if="showCheckModal" @click="modalVisible = true"> 详情 </a>
          </a-flex>
        </a-flex>
        <a-flex class="attr-item-wrapper leading-40px">
          <span>变量描述</span>
          <span :title="detailRow?.description ?? ''" class="px-4 overflow-hidden-one flex-1 text-left">
            {{ detailRow?.description ?? '--' }}
          </span>
        </a-flex>
      </div>
    </Transition>
    <!-- 部分类型弹框查看 -->
    <!-- <StructureTypeCheck
      v-model:visible="modalVisible"
      :value="detailRow?.dataType"
      :title="detailRow?.dataType?.reference?.name ?? detailRow?.name"
    /> -->
  </a-flex>
</template>

<style lang="less" scoped>
.switcher-icon {
  color: #717579;
  transition: transform 0.3s;
  cursor: pointer;
  font-size: 12px;
  margin-right: 3px;
  &.expand {
    transform: rotate(-90deg);
  }
}
.detail-info-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ant-colorBgBase);
  border-top: 1px solid var(--ant-colorBorderSecondary);
  .title {
    background-color: var(--ant-colorBgLayout);
    height: 35px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .attr-item-wrapper {
    & > span {
      border-right: 1px solid var(--ant-colorBorderSecondary);
      &:first-child {
        flex: 0 0 100px;
        color: #838388;
        text-align: right;
      }
      padding-left: 20px;
      padding-right: 20px;
    }
    &:not(:last-child) {
      border-bottom: 1px solid var(--ant-colorBorderSecondary);
    }
  }
}
</style>
