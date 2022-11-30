import { createReadStream, createWriteStream, rename } from 'fs'
import type { Config } from 'vite-plugin-unocss-bgimg'
import { isExists, readdirHandle } from './util'

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
const copy = function (src: string, dst: string) {
  return new Promise((resolve: any, reject: any) => {
    // 读取目录中的所有文件/目录
    readdirHandle(src, (path: string) => {
      const _src = `${src}/${path}`
      const _dst = `${dst}/${path}`

      // 创建读取流
      const readable = createReadStream(_src)
      // 创建写入流
      const writable = createWriteStream(_dst)
      // 通过管道来传输流
      readable.pipe(writable)

      resolve()
    }, reject)
  })
}

/**
 *
 * @param config
 */
export function bgImgCopy(config: Config) {
  isExists(config.src, config.dest, copy)
}

/**
 *
 * @param src : ;
 * @param dst
 * @param hash
 */
export function bgImgCopyRename(src: string, dst: string, hash: string | undefined = '') {
  // 读取目录中的所有文件/目录
  readdirHandle(src, (path: string) => {
    const _dst = `${dst}/${path}`
    const reg = /\.(?=[\w]+$)/
    rename(_dst, _dst.replace(reg, `.${hash}.`), (err) => {
      if (err)
        throw (err)
    })
  })
}
