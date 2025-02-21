import { type Res } from '@common/types';
import request from './request';

// const base = 'https://www.fastmock.site/mock/2529bde1048f63ab5e865df013c7f6e6/api'

export interface LoginState {
  name: string;
  password: string;
}

interface ResDataType {
  code: number
  msg: string
  data: any
  success: boolean
}

export interface RegisterState extends LoginState {
  repeatpass: string
}

export function applyList(): Promise<Res<any>> {
  return request.get(`/api/apply`) || {}
}

// 登录
export function login(params: LoginState): Promise<Res<any>> {
  return request.post(`/api/auth/login`, params) || {}
}

// 注册
export function register(params: RegisterState): Promise<Res<any>> {
  return request.post(`/api/auth/register`, params) || {}
}

// 创建页面
export function createPage(params: any): Promise<Res<any>> {
  return request.post(`/api/page/create`, params) || {}
}

// 获取页面列表
export function getPageList(params: any): Promise<Res<ResDataType>> {
  return request.post(`/api/page/list`, params) || {}
}

// 获取页面详情
export function getPageDetail(id: string): Promise<Res<any>> {
  return request.get(`/api/page/${id}`) || {}
}

// 更新页面
export function updatePage(params: any): Promise<Res<any>> {
  return request.patch(`/api/page`, params) || {}
}

// 获取page数据
export function getPageData(params: any): Promise<Res<any>> {
  return request.post(`/api/page/data`, params) || {}
}

// 添加page数据
export function addPageData(params: { tableName: string, data: object }): Promise<Res<any>> {
  return request.post(`/api/page/add-data`, params) || {}
}
