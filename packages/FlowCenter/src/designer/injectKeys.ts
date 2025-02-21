import { type ComputedRef, type InjectionKey } from "vue";
import useDesignerStore from "./useDesignerStore";
import { type FlowNode } from "../types";

export const themeInjectKey = Symbol('theme') as InjectionKey<ComputedRef<string>>
export const modeInjectKey = Symbol('mode') as InjectionKey<ComputedRef<'edit' | 'preview'>>

export const designerStoreInjectKey = Symbol('designerStore') as InjectionKey<ReturnType<typeof useDesignerStore>>

export const parentNodesInjectKey = Symbol('parentNodes') as InjectionKey<ComputedRef<FlowNode[]>>
