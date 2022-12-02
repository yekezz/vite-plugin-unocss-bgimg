import chokidar from 'chokidar'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { collectFileMap, collectFileMapDebounce } from './util'
import { serveMiddleware } from './serveMiddleware'
import type { VitePluginUnocssBgImgOptions } from '.'

interface FileMapValue {
  src: string
}
export type FileMap = Map<string, FileMapValue[]>

export function servePlugin(options: VitePluginUnocssBgImgOptions): Plugin {
  let globalOptions: ResolvedConfig
  let watcher: chokidar.FSWatcher
  const fileMap: FileMap = new Map()

  return {
    name: 'vite-plugin-unocss-bgimg:serve',
    apply: 'serve',
    configResolved(_options: ResolvedConfig) {
      globalOptions = _options
    },
    async buildStart() {
      await collectFileMap(options, fileMap)
    },
    configureServer(server: ViteDevServer) {
      // cannot use server.watcher since disableGlobbing is true
      watcher = chokidar.watch(
        [options].flatMap(option => option.src),
        {
          cwd: globalOptions.root,
          ignoreInitial: true,
        },
      )
      watcher.on('add', async () => {
        await collectFileMapDebounce()
      })
      watcher.on('unlink', async () => {
        await collectFileMapDebounce()
      })
      server.middlewares.use(serveMiddleware(globalOptions.root, fileMap))
    },
    async closeBundle() {
      await watcher.close()
    },
  }
}
