import { addReplaceHandler, HandleEvents } from 'core'
import { EVENTTYPES } from '@/common'

export function setupReplace(): void {
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error)
    },
    type: EVENTTYPES.ERROR
  })
}
