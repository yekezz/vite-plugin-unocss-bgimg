import { bgImgHandle } from './bgImgHandle'
import { cssHandle } from './cssHandle'
import { createHash } from './util'

export interface Config {
  src: string
  dest: string
}

export default function (config: Config) {
  const hash = createHash(8)
  let globalConfig: any
  return {
    name: 'vite-plugin-unocss-bgimg',
    apply: 'build',
    configResolved(_config: any) {
      globalConfig = _config
    },
    async writeBundle() {
      // 给背景图片的css样式加上hash
      cssHandle(config, globalConfig, hash)
      bgImgHandle(config, globalConfig, hash)
    },
  }
}
