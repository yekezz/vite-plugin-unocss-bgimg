import { resolve } from 'node:path'
import type { Stats } from 'node:fs'
import { createReadStream, statSync } from 'node:fs'
import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from 'node:http'
import type * as http from 'node:http'
import { lookup } from 'mrmime'
import type { FileMap } from './servePlugin'

function viaLocal(root: string, fileMap: FileMap, uri: string) {
  if (uri.endsWith('/'))
    uri = uri.slice(0, -1)

  const files = fileMap.get(uri)
  if (files && files[0]) {
    const file = files[0]
    const filepath = resolve(root, file.src)
    const stats = statSync(filepath)
    return { filepath, stats }
  }

  for (const [key, vals] of fileMap) {
    const dir = key.endsWith('/') ? key : `${key}/`
    if (!uri.startsWith(dir)) continue

    for (const val of vals) {
      const filepath = resolve(root, val.src, uri.slice(dir.length))
      try {
        const stats = statSync(filepath)
        return { filepath, stats }
      }
      catch {
        // file not found
      }
    }
    // no entry matched for this prefix
    return undefined
  }

  return undefined
}

function getStaticHeaders(name: string, stats: Stats) {
  let ctype = lookup(name) || ''
  if (ctype === 'text/html') ctype += ';charset=utf-8'

  const headers: OutgoingHttpHeaders = {
    'Content-Length': stats.size,
    'Content-Type': ctype,
    'Last-Modified': stats.mtime.toUTCString(),
    'ETag': `W/"${stats.size}-${stats.mtime.getTime()}"`,
    'Cache-Control': 'no-cache',
  }

  return headers
}

function getMergeHeaders(headers: OutgoingHttpHeaders, res: ServerResponse) {
  headers = { ...headers }

  for (const key in headers) {
    const tmp = res.getHeader(key)
    if (tmp) headers[key] = tmp
  }

  const contentTypeHeader = res.getHeader('content-type')
  if (contentTypeHeader)
    headers['Content-Type'] = contentTypeHeader

  return headers
}

function sendStatic(
  req: IncomingMessage,
  res: ServerResponse,
  file: string,
  stats: Stats,
) {
  const staticHeaders = getStaticHeaders(file, stats)

  if (req.headers['if-none-match'] === staticHeaders.ETag) {
    res.writeHead(304)
    res.end()
    return
  }

  let code = 200
  const headers = getMergeHeaders(staticHeaders, res)
  const opts: { start?: number; end?: number } = {}

  if (req.headers.range) {
    code = 206
    const [x, y] = req.headers.range.replace('bytes=', '').split('-')
    const end = (y ? parseInt(y, 10) : 0) || stats.size - 1
    const start = (x ? parseInt(x, 10) : 0) || 0
    opts.end = end
    opts.start = start

    if (start >= stats.size || end >= stats.size) {
      res.setHeader('Content-Range', `bytes */${stats.size}`)
      res.statusCode = 416
      res.end()
      return
    }

    headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`
    headers['Content-Length'] = end - start + 1
    headers['Accept-Ranges'] = 'bytes'
  }

  res.writeHead(code, headers)
  createReadStream(file, opts).pipe(res)
}

function return404(res: ServerResponse, next: Function) {
  if (next) {
    next()
    return
  }
  res.statusCode = 404
  res.end()
}

export function serveMiddleware(
  root: string,
  fileMap: FileMap,
) {
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  return async function viteServeStaticCopyMiddleware(req: http.IncomingMessage, res: http.ServerResponse, next: Function) {
    let pathname = req.url
    if (!pathname)
      return res.end()

    if (pathname.includes('%')) {
      try {
        pathname = decodeURIComponent(pathname)
      }
      catch (err) {
        /* malform uri */
      }
    }

    const data = viaLocal(root, fileMap, pathname)
    if (!data) {
      return404(res, next)
      return
    }

    sendStatic(req, res, data.filepath, data.stats)
  }
}
