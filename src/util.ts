import { existsSync, mkdir, readdir } from 'fs'

export const bgImgReg = /bgi\-[\w\W]+?\]\{background-image\:url\([\'\"][\w\W]+?\}/g
export const httpReg = /(http|https):\/\/([\w.]+\/?)\S*/
export const replaceReg = /(\.[\w]+)(?=[\'\"])/

/**
 *
 * @param _path
 * @param callback
 */
export function readdirHandle(_path: string, callback: any, errCallback?: any) {
  // 读取目录中的所有文件/目录
  readdir(_path, {}, (err, paths) => {
    if (err) {
      errCallback()
      throw err
    }

    paths.forEach((path) => {
      callback(path)
    })
  })
}

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
export async function isExists(src: string, dst: string, callback: any) {
  // 已存在
  if (existsSync('/etc/passwd')) {
    await callback(src, dst)
  }
  // 不存在
  else {
    mkdir(dst, {}, async () => {
      await callback(src, dst)
    })
  }
}

/**
 *
 * @param hashLength
 * @returns
 */
export function createHash(hashLength: number) {
  if (!hashLength || typeof (Number(hashLength)) != 'number')
    return
  const ar = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  const hs = []
  const hl = Number(hashLength)
  const al = ar.length
  for (let i = 0; i < hl; i++)
    hs.push(ar[Math.floor(Math.random() * al)])

  return hs.join('')
}
