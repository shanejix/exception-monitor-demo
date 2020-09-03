
import { ERRORTYPES, ERROR_TYPE_RE } from '@/common'

export interface ResourceErrorTarget {
  src?: string
  href?: string
  localName?: string
}

const HandleEvents = {

  /**
   * 处理window的error的监听回到
   */
  handleError(errorEvent: ErrorEvent): void {
    const target = errorEvent.target as ResourceErrorTarget
    if (target.localName) {
      // 资源加载错误
      // 提取有用数据
      // const data = resourceTransform(errorEvent.target as ResourceErrorTarget)

      // push到行为栈
      // breadcrumb.push({
      //   type: BREADCRUMBTYPES.RESOURCE,
      //   category: breadcrumb.getCategory(BREADCRUMBTYPES.RESOURCE),
      //   data,
      //   level: Severity.Error
      // })

      // 上报错误
      // return transportData.xhrPost(data)
    }
    // code error
    const { message, filename, lineno, colno, error } = errorEvent


  },

}

export { HandleEvents }
