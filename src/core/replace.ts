
import { EVENTTYPES, voidFun, HTTPTYPE } from '@/common'
import {
  _global,
  setFlag,
  getFlag,
  on,
  nativeTryCatch,
  replaceOld,
  isString,
  getTimestamp
} from 'utils'

import { transportData } from './transportData'

type ReplaceCallback = (data: any) => void

interface ReplaceHandler {
  type: EVENTTYPES
  callback: ReplaceCallback
}


const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {}

export interface MITOXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any
  mito_xhr?: MITOHttp
}

export interface MITOHttp {
  type: HTTPTYPE
  method?: string
  url?: string
  status?: number
  reqData?: any
  statusText?: string
  sTime?: number
  elapsedTime?: number
  responseText?: any
  time?: number
  isSdkUrl?: boolean
}

function triggerHandlers(type: EVENTTYPES, data: any): void {
  if (!type || !handlers[type]) return
  handlers[type].forEach((callback) => {
    nativeTryCatch(
      () => {
        callback(data)
      },
      (e: Error) => {
        // logger.error(`重写事件triggerHandlers的回调函数发生错误\nType:${type}\nName: ${getFunctionName(callback)}\nError: ${e}`)
      }
    )
  })
}


function listenError(): void {
  on(
    _global,
    'error',
    function (e: ErrorEvent) {
      triggerHandlers(EVENTTYPES.ERROR, e)
    },
    true
  )
}

function unhandledrejectionReplace(): void {
  on(_global,
    EVENTTYPES.UNHANDLEDREJECTION,
    function (ev: PromiseRejectionEvent) {
      // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
      triggerHandlers(EVENTTYPES.UNHANDLEDREJECTION, ev)
    }
  )
}

function xhrReplace(): void {
  if (!('XMLHttpRequest' in _global)) {
    return
  }
  const originalXhrProto = XMLHttpRequest.prototype
  replaceOld(
    originalXhrProto,
    'open',
    (originalOpen: voidFun): voidFun => {
      return function (this: MITOXMLHttpRequest, ...args: any[]): void {
        const url = args[1]
        this.mito_xhr = {
          method: isString(args[0]) ? args[0].toUpperCase() : args[0],
          url: args[1],
          sTime: getTimestamp(),
          type: HTTPTYPE.XHR
        }
        // 需要判断如果是监控本身自己得请求做个标记，不发送请求
        if (this.mito_xhr.method === 'POST' && transportData.isSdkTransportUrl(url)) {
          this.mito_xhr.isSdkUrl = true
        }
        originalOpen.apply(this, args)
      }
    }
  )
  replaceOld(
    originalXhrProto,
    'send',
    (originalSend: voidFun): voidFun => {
      return function (this: MITOXMLHttpRequest, ...args: any[]): void {
        on(this, 'loadend', function (this: MITOXMLHttpRequest) {
          if (this.mito_xhr.isSdkUrl) return
          this.mito_xhr.reqData = args[0]
          const eTime = getTimestamp()
          this.mito_xhr.time = eTime
          this.mito_xhr.status = this.status
          this.mito_xhr.statusText = this.statusText
          this.mito_xhr.responseText = this.responseText
          this.mito_xhr.elapsedTime = eTime - this.mito_xhr.sTime
          triggerHandlers(EVENTTYPES.XHR, this.mito_xhr)
        })
        originalSend.apply(this, args)
      }
    }
  )
}

function replace(type: EVENTTYPES) {
  switch (type) {
    // case EVENTTYPES.XHR:
    //   xhrReplace()
    //   break
    // case EVENTTYPES.FETCH:
    //   fetchReplace()
    //   break
    case EVENTTYPES.ERROR:
      listenError()
      break
    // case EVENTTYPES.CONSOLE:
    //   replaceConsole()
    //   break
    // case EVENTTYPES.HISTORY:
    //   replaceHistory()
    //   break
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace()
      break
    // case EVENTTYPES.DOM:
    //   domReplace()
    //   break
    // case EVENTTYPES.HASHCHANGE:
    //   listenHashchange()
    //   break
    default:
      break
  }
}

export function addReplaceHandler(handler: ReplaceHandler): void {
  if (!handler) {
    return
  }
  if (getFlag(handler.type)) return
  setFlag(handler.type, true)
  handlers[handler.type] = handlers[handler.type] || []
  handlers[handler.type].push(handler.callback)
  replace(handler.type)
}