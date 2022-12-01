import path from 'node:path'
import fs from 'fs-extra'
import { replaceReg } from './util'
import type { Config } from '.'

/**
 *
 * @param root
 * @param rootDest
 * @param config
 * @returns
 */
async function copy(root: string, rootDest: string, config: Config) {
  const { src, dest } = config
  const resolveSrc = path.resolve(root, src)
  const resolveDest = path.resolve(root, rootDest, dest)
  return fs.copy(resolveSrc, resolveDest)
}

/**
 *
 * @param config
 */
export function bgImgCopy(config: Config, globalConfig: any) {
  return copy(globalConfig.root, globalConfig.build.outDir, config)
}

/**
 *
 * @param src
 * @param dst
 * @param hash
 */
export function rename(config: Config, globalConfig: any, hash: string | undefined = '') {
  const { src, dest } = config
  const { root, build } = globalConfig
  const resolveSrc = path.resolve(root, src)
  // 重命名
  fs.readdir(resolveSrc, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err)
      throw err
    files.forEach(async (i) => {
      const oldPath = path.resolve(root, build.outDir, dest, i)
      const newPath = path.resolve(root, build.outDir, dest, i.replace(replaceReg, (_m, p) => {
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
 * @param config
 * @param globalConfig
 * @param hash
 */
export async function bgImgHandle(config: Config, globalConfig: any, hash: string | undefined = '') {
  try {
    // copy dir
    await copy(globalConfig.root, globalConfig.build.outDir, config)
    // rename file
    rename(config, globalConfig, hash)
  }
  catch (error) {
    console.error(error)
  }
}
