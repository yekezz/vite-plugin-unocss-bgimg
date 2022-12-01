import path from 'node:path'
import fs from 'fs-extra'
import type { ResolvedConfig } from 'vite'
import { bgImgReg, httpReg, replaceReg } from './util'
import type { Config } from '.'

/**
 *
 * @param content
 * @param hash
 * @returns
 */
function replaceBgImgCss(content: string, hash: string) {
  let bgImgArr: RegExpMatchArray | null = content.match(bgImgReg)
  if (!bgImgArr)
    return null
  bgImgArr = bgImgArr.filter((i) => {
    return !httpReg.test(i)
  })
  const targetArr = bgImgArr.map((i) => {
    i = i.replace(replaceReg, (c) => {
      return `.${hash}${c}`
    })
    return i
  })

  bgImgArr.forEach((i, index) => {
    content = content.replace(i, targetArr[index])
  })
  return content
}

/**
 *
 * @param resolveDest
 * @param hash
 */
function modifyCssContent(resolveDest: string, hash: string | undefined = '') {
  fs.readdir(resolveDest, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err)
      throw err

    files.forEach(async (i) => {
      if (!i.includes('.css'))
        return null

      const filePath = path.resolve(resolveDest, i)

      fs.readFile(filePath, { encoding: 'utf8' }, (err: NodeJS.ErrnoException, content: any) => {
        if (err)
          throw err

        content = replaceBgImgCss(content, hash) || content

        fs.outputFile(filePath, content, { encoding: 'utf8' }, (err) => {
          if (err)
            throw err
        })
      })
    })
  })
}

/**
 *
 * @param config
 * @param globalConfig
 * @param hash
 */
export function cssHandle(config: Config, globalConfig: ResolvedConfig, hash: string | undefined = '') {
  const { dest } = config
  const { root, build } = globalConfig
  const resolveDest = path.resolve(root, build.outDir, dest)

  modifyCssContent(resolveDest, hash)
}
