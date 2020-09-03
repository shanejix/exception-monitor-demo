
// 用到所有事件名称
type TotalEventName = keyof GlobalEventHandlersEventMap | keyof XMLHttpRequestEventTargetEventMap | keyof WindowEventMap

/**
 * 添加事件监听器
 *
 * @export
 * @param {{ addEventListener: Function }} target
 * @param {keyof TotalEventName} eventName
 * @param {Function} handler
 * @param {(boolean | Object)} opitons
 * @returns
 */
export function on(target: { addEventListener: Function }, eventName: TotalEventName, handler: Function, opitons: boolean | unknown = false): void {
  target.addEventListener(eventName, handler, opitons)
}
