// import { useHttp } from '@opentiny/tiny-engine-http'

// const http = useHttp()
// const apihubPrefix = window.$envConfig.apihubBaseUrl
// const apitaskPrefix = window.$envConfig.apitaskBaseUrl

// const prefix = `${apihubPrefix}/api/v1/service/apihub`
// 获取应用的服务列表
export const microInfoRecord = (params: any) => {}
// 获取api列表树
export const getApiGroupTree = (params: { serviceInfoId: string; groupType: string }) => {}

// 根据refId获取下级模型结构
export const getModelDetails = (id: string) => {}
// 获取页面列表
// TODO 接口替换
// export const fetchPageList = (appId) => http.get(`/app-center/api/pages/list/${appId}`)
export const fetchPageList = async () => {}