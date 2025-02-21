<template>
  <div class="dashboard-wrapper">
    <div class="left-panel">
      <div class="header">
        <a-button type="primary" class="flex items-center justify-center" :icon="h(ArrowLeftOutlined)" @click="goBack" />
        <span class="ml-[10px]">{{ appName }}</span>
      </div>

      <div class="search flex m-[10px]">
        <a-input type="text" style="margin-right: 10px;" placeholder="搜索..." v-model="searchQuery" />
        <a-button type="primary" @click="addPage">
          新建
        </a-button>
      </div>
      <div class="mt-[20px]">
        <!-- 页面列表展示 -->
        <div
          class="mx-[10px] px-[20px] rounded-[5px] box-border text-[14px] cursor-pointer h-[40px] leading-[40px] bg-[#fff] hover:bg-[#e6e8ed] hover:text-[#000] mb-[1px]"
          :class="[activePage && item.id === activePage.id ? 'active' : '']"
          v-for="item in pageList"
          :key="item.id"
          @click="handlePageClick(item)"
        >
          {{ item.pageName }}
        </div>
      </div>
    </div>
    <div class="right-panel">
      <template v-if="activePage">
        <div class="top flex items-center px-[10px]">
          <div class="mr-[10px]">{{ activePage.pageName }}</div>
          <a-divider type="vertical" />
          <a-button type="text" @click="editPage">
            <template #icon>
              <EditOutlined />
            </template>
            编辑
          </a-button>
          <a-divider type="vertical" />
          <a-radio-group v-model:value="showType" @change="handleShowTypeChange">
            <a-radio-button value="form">表单输入</a-radio-button>
            <a-radio-button value="data">数据管理</a-radio-button>
          </a-radio-group>
        </div>
        <div class="middle">
          <template v-if="formRules">
            <form-create
              v-if="showType === 'form'"
              v-model:modelValue="formData"
              v-model:api="formApi"
              :rule="formRules"
              @submit="handleSubmit"
            />
            <div v-if="showType === 'data'">
              <a-table :columns="columns" :data-source="pageData" />
            </div>
          </template>
          <div v-else>
            <a-empty />
          </div>
        </div>
      </template>
    </div>
  </div>
  <a-modal v-model:open="open" title="新建页面" @ok="handleOk">
    <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="页面名称">
        <a-input v-model:value="form.pageName" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang='ts'>
  import { ref, onMounted, h } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ArrowLeftOutlined, SearchOutlined, EditOutlined, DatabaseOutlined } from '@ant-design/icons-vue'
  import { getPageList, createPage, getPageDetail, getPageData, addPageData } from '@/apis/common'
  import { message } from 'ant-design-vue'
  const router = useRouter()
  const route = useRoute()
  const searchQuery = ref('')
  const appId = ref('')
  const appName = ref('')
  // 页面列表
  const pageList = ref<any>([])
  const open = ref(false)
  const form = ref({
    pageName: ''
  })
  // 当前选中的页面
  const activePage = ref()
  const formData = ref({});
  const formApi = ref();
  const formRules = ref();
  const showType = ref('form')

  const columns = ref()
  const pageData = ref([])


  const handleOk = async () => {
    const res = await createPage({
      appId: appId.value,
      pageName: form.value.pageName,
      pageType: '1'
    })
    console.log(res);
    open.value = false
    
    if (res.success) {
      const { data } = res
      router.push(`/formDesign?appId=${appId.value}&pageName=${data.pageName}&pageId=${data.pageId}`);
    }
  }
  const addPage = () => {
    // router.push('/formDesign');
    open.value = true
  };
  const goBack = () => {
    router.push('/apply')
  }

  const _getPageList = async () => {
    const res = await getPageList({
      appId: appId.value,
    })
    console.log(res);
    pageList.value = res.data
  }

  const handlePageClick = async (item: any) => {
    console.log('item==', item, activePage.value);
    if (activePage.value && activePage.value.id === item.id) {
      return
    }
    formRules.value = null;
    activePage.value = item
    // router.push(`/dashboard?appId=${appId.value}&appName=${appName.value}&pageId=${id}`)
    const res = await getPageDetail(item.pageId)
    console.log('res==', res);
    const _rule = JSON.parse(res.data.rule)
    if (res.data.rule) {
      formRules.value = _rule
      columns.value = _rule.map((item: any) => {
        return {
          title: item.title,
          dataIndex: item.field,
        }
      })
    }
  }
  const editPage = () => {
    router.push(`/formDesign?appId=${appId.value}&pageName=${activePage.value.pageName}&pageId=${activePage.value.pageId}`)
  }
  const handleShowTypeChange = async (e: any) => {
    console.log('activePage.value==', e.target.value);
    const val = e.target.value
    if (val === 'data') {
      // 获取table数据
      const res = await getPageData({
        tableName: activePage.value.pageId,
        page: 1,
        pageSize: 10
      })
      console.log('res==', res);
      if (res.success) {
        pageData.value = res.data
      }
    }
  }
  // 表单提交
  const handleSubmit = async (formData: any) => {
    console.log('formData==', formData);
    const res = await addPageData({
      tableName: activePage.value.pageId,
      data: formData
    })
    console.log('res==', res);
    if (res.success) {
      message.success('添加成功')
      formData.value = {}
    } else {
      message.error(res.msg)
    }
  }

  onMounted(async () => {
    appId.value = route.query.appId as string
    appName.value = route.query.appName as string
    await _getPageList()
    
    await handlePageClick(pageList.value[0])
    
  })
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  height: 100vh;
  /* background-color: #f5f5f5; */
}

.left-panel {
  width: 300px; /* 左侧宽度 */
  overflow: hidden; /* 禁止滚动 */
  border-right: 1px solid #ddd; /* 右边框 */
  background-color: #ffffff; /* 左侧背景色 */
}

.header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px; /* 内边距 */
  border-bottom: 1px solid #ddd; /* 底部边框 */
  /* background-color: #f0f0f0; */
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top {
  height: 50px;
  border-bottom: 1px solid #ddd;
  /* background-color: #e9e9e9; */
}

.middle {
  padding: 10px;
  flex: 1; /* 自适应中间区域 */
  background-color: #ffffff; /* 中间区域背景色 */
}

.active {
  background-color: #e0e0e0;
  color: #141E31;
}
</style>
