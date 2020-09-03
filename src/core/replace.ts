
import { EVENTTYPES } from '@/common'
import {
  _global,
  setFlag,
  getFlag,
  on,
  nativeTryCatch
} from 'utils'

type ReplaceCallback = (data: any) => void

interface ReplaceHandler {
  type: EVENTTYPES
  callback: ReplaceCallback
}


const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {}

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

function replace(type: EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.ERROR:
      listenError()
      break
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