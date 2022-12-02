import type { Plugin } from 'vite'
import { buildPlugin } from './buildPlugin'
import { servePlugin } from './servePlugin'

export interface VitePluginUnocssBgImgOptions {
  src: string
  dest: string
}

export function UnocssBgImg(options: VitePluginUnocssBgImgOptions): Plugin[] {
  return [servePlugin(options), buildPlugin(options)]
}
