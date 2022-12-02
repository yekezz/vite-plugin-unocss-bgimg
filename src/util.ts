import type { FileMap } from './servePlugin'
export const bgImgReg = /bgi\-[\w\W]+?\]\{background-image\:url\([\'\"][\w\W]+?\}/g
export const httpReg = /(http|https):\/\/([\w.]+\/?)\S*/
export const replaceReg = /(\.[\w]+)(?=[\'\"])/
export const fileNameReg = /(\.[\w]+)$/

export interface VitePluginUnocssBgImgOptions {
  src: string
  dest: string
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

/**
 *
 * @param targets
 * @param fileMap
 */
export const updateFileMapFromTargets = (
  targets: VitePluginUnocssBgImgOptions[],
  fileMap: FileMap,
) => {
  fileMap.clear()
  for (const target of [...targets].reverse()) {
    let dest = target.dest.replace(/\\/g, '/')
    if (!dest.startsWith('/'))
      dest = `/${dest}`

    if (!fileMap.has(dest))
      fileMap.set(dest, [])

    fileMap.get(dest)!.push({
      src: target.src,
    })
  }
}

/**
 *
 * @param delay
 * @param fn
 * @param ctx
 * @returns
 */
function debounce(delay = 500, fn: Function, ctx?: any) {
  let timer: NodeJS.Timeout | null = null

  return function (...params: any[]) {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(() => {
      // eslint-disable-next-line prefer-rest-params
      fn.apply(ctx, params)
      timer = null
    }, delay)
  }
}

/**
 *
 * @param options
 * @param fileMap
 */
export const collectFileMap = (options: VitePluginUnocssBgImgOptions, fileMap: FileMap) => {
  try {
    const copyTargets = [options]
    updateFileMapFromTargets(copyTargets, fileMap)
  }
  catch (e) {
    console.error(e)
  }
}

/**
 *
 */
export const collectFileMapDebounce = debounce(100, async (options: VitePluginUnocssBgImgOptions, fileMap: FileMap) => {
  collectFileMap(options, fileMap)
})
