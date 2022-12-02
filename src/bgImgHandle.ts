import path from 'node:path'
import fs from 'fs-extra'
import type { ResolvedConfig } from 'vite'
import { fileNameReg } from './util'
import type { VitePluginUnocssBgImgOptions } from './util'

/**
 *
 * @param root
 * @param rootDest
 * @param options
 * @returns
 */
async function copy(root: string, rootDest: string, options: VitePluginUnocssBgImgOptions) {
  const { src, dest } = options
  const resolveSrc = path.resolve(root, src)
  const resolveDest = path.resolve(root, rootDest, dest)
  return fs.copy(resolveSrc, resolveDest)
}

/**
 *
 * @param src
 * @param dst
 * @param hash
 */
export function rename(options: VitePluginUnocssBgImgOptions, globalOptions: ResolvedConfig, hash: string | undefined = '') {
  const { src, dest } = options
  const { root, build } = globalOptions
  const resolveSrc = path.resolve(root, src)
  // 重命名
  fs.readdir(resolveSrc, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err)
      throw err
    files.forEach(async (i) => {
      const oldPath = path.resolve(root, build.outDir, dest, i)
      const newPath = path.resolve(root, build.outDir, dest, i.replace(fileNameReg, (_m, p) => {
        return `.${hash}${p}`
      }))
      try {
        await fs.rename(oldPath, newPath)
      }
      catch (error) {
        console.error(error)
      }
    })
  })
}

/**
 *
 * @param options
 * @param globalOptions
 * @param hash
 */
export async function bgImgHandle(options: VitePluginUnocssBgImgOptions, globalOptions: ResolvedConfig, hash: string | undefined = '') {
  try {
    // copy dir
    await copy(globalOptions.root, globalOptions.build.outDir, options)
    // rename file
    rename(options, globalOptions, hash)
  }
  catch (error) {
    console.error(error)
  }
}
