<template>
  <div class="designer-wrapper">
    <div class="header">
      <!-- 上部分内容 -->
      <LeftOutlined class="back-icon" @click="goBack" />
      <span class="ml-[10px]" style="color: #2e73ff;">{{ pageData.pageName }}</span>
    </div>
    <div class="content" style="flex: 1;">
      <!-- 下部分内容 -->
      <fc-designer
        ref="designerRef"
        :value="pageData.rule"
        :config="{
          showSaveBtn: true,
        }"
        @save="save"
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { getPageDetail } from '@/apis/common'
import { updatePage } from '@/apis/common'
import { message } from 'ant-design-vue'
const router = useRouter()
const route = useRoute()

// 在这里定义响应式数据和方法
const pageData = ref<any>({
  rule: {},
  options: {}
});

const designerRef = ref<any>(null)

const submitForm = () => {
  // 提交表单逻辑
};

const goBack = () => {
  router.back();
};

const save = async (data: { rule: any, options: any }) => {
  console.log('save', data);
  pageData.value.rule = data.rule
  pageData.value.pageConfig = data.options
  console.log('pageData', pageData.value);
  const res = await updatePage(pageData.value)
  console.log(res);
  if (res.code === 200) {
    message.success('保存成功')
  } else {
    message.error('保存失败')
  }
}

onMounted(async () => {
  console.log('onMounted', designerRef.value);
  const pageId = route.query.pageId as string
  const pageName = route.query.pageName as string
  const appId = route.query.appId as string
  console.log(pageId, pageName, appId);
  const res = await getPageDetail(pageId)
  console.log(res, designerRef);
  pageData.value = res.data
  // pageData.value.rule = JSON.parse(res.data.rule)
  // pageData.value.options = JSON.parse(res.data.pageConfig)
  designerRef.value.setRule(res.data.rule)
  designerRef.value.setOption(res.data.pageConfig)
})
</script>

<style scoped>
.designer-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 使容器高度为视口高度 */
}
.header {
  /* 上部分样式 */
  height: 50px;
  /* background-color: #f0f0f0; */
  /* border-bottom: 1px solid #ddd; */
  display: flex;
  align-items: center;
  padding-left: 20px;
  /* justify-content: center; */
}
.back-icon {
  cursor: pointer;
  color: #2e73ff;
  font-size: 20px;
}
.content {
  /* 下部分样式 */
}
</style>
