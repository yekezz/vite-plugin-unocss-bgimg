import type { Plugin } from 'vite'
import { buildPlugin } from './buildPlugin'
import { servePlugin } from './servePlugin'
import type { VitePluginUnocssBgImgOptions } from './util'

/**
 *
 * @param options
 * @returns
 */
export default function UnocssBgImg(options: VitePluginUnocssBgImgOptions): Plugin[] {
  return [servePlugin(options), buildPlugin(options)]
}
