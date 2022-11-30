import { readFile, writeFile } from 'fs'
import { bgImgReg, httpReg, readdirHandle, replaceReg } from './util'

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
 * @param dst path
 * @param hash
 */
export function cssHandle(dst: string, hash: string | undefined = '') {
  readdirHandle(dst, (path: string) => {
    // const _src = `${src}/${path}`
    const _dst = `${dst}/${path}`
    if (!_dst.includes('.css'))
      return null
    // content = readFileSync(_dst, { encoding: 'utf8' })
    readFile(_dst, { encoding: 'utf8' }, (err, content) => {
      if (err)
        throw err
      content = replaceBgImgCss(content, hash) || content
      writeFile(_dst, content, { encoding: 'utf8' }, (err) => {
        if (err)
          throw err
      })
    })
  })
}
