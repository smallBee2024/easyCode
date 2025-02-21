<!--
 * @Author: Anxure
 * @Desc: 变量列表
 * @Date: 2024-07-31 11:13:44
 * @LastEditors: Anxure
 * @LastEditTime: 2024-07-31 18:15:11
-->
<script lang="ts" setup>
import { ref, computed } from 'vue'
import VariableList from './variableList/index.vue'
// import { IconFont } from '../../materials/resource/components'
const props = withDefaults(
  defineProps<{
    visible: boolean
    type: 'var'
  }>(),
  {
    visible: false,
    type: 'var'
  }
)
const emits = defineEmits(['update:visible'])
</script>

<template>
  <transition name="slide-fade">
    <div v-if="visible" class="component-panel">
      <a-flex align="center" justify="space-between" class="header px-3">
        <span style="font-size: 16px">{{ type === 'var' ? '变量列表' : '' }}</span>
        <a-space>
          <!-- 先不做这个 -->
          <!-- <icon-font
            @click="toggleFixed"
            :title="isFixed ? '固定' : '非固定'"
            class="cursor-pointer"
            size="18px"
            :type="isFixed ? 'icon-fixed' : 'icon-not-fixed'"
          ></icon-font> -->
          <!-- <icon-font
            class="cursor-pointer"
            size="18px"
            @click="emits('update:visible', false)"
            type="icon-close"
          ></icon-font> -->
        </a-space>
      </a-flex>
      <!-- TODO:可以显示更多组件 -->
      <div style="height: calc(100% - 48px)" class="overflow-y-auto">
        <VariableList />
      </div>
    </div>
  </transition>
</template>
<style lang="less">
/* 进入之前的样式 */
.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

/* 离开后的样式 */
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 进入和离开的过渡效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
</style>
<style lang="less" scoped>
.component-panel {
  height: 100%;
  width: 300px;
  background-color: #fff;
  box-shadow: 4px 6px 6px 0 rgba(31, 50, 88, 0.08);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  .header {
    border-bottom: 1px solid var(--ant-colorBorder);
    height: 40px;
  }
}
</style>
