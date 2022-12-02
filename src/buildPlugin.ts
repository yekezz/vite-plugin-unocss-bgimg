import type { Plugin, ResolvedConfig } from 'vite'
import { bgImgHandle } from './bgImgHandle'
import { cssHandle } from './cssHandle'
import { createHash } from './util'
import type { VitePluginUnocssBgImgOptions } from '.'

export function buildPlugin(options: VitePluginUnocssBgImgOptions): Plugin {
  const hash = createHash(8)
  let globalOptions: ResolvedConfig
  return {
    name: 'vite-plugin-unocss-bgimg:build',
    apply: 'build',
    configResolved(_options: ResolvedConfig) {
      globalOptions = _options
    },
    async writeBundle() {
      // 给背景图片的css样式加上hash
      cssHandle(options, globalOptions, hash)
      bgImgHandle(options, globalOptions, hash)
    },
  }
}
