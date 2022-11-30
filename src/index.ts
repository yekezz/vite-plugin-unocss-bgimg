import { bgImgCopy, bgImgCopyRename } from './bgImgHandle'
import { cssHandle } from './cssHandle'
import { createHash } from './util'

export interface Config {
  src: string
  dest: string
}

export default function (config: Config) {
  const { src, dest } = config
  const hash = createHash(8)
  return {
    name: 'vite-plugin-unocss-bgimg',
    apply: 'build',
    async writeBundle() {
      // 给背景图片的css样式加上hash
      cssHandle(dest, hash)
      // 复制背景图片
      bgImgCopy(config)
    },
    closeBundle() {
      // 给背景图片加上hash
      bgImgCopyRename(src, dest, hash)
    },
  }
}
