// @flow

import Mdc from './Mdc'
import type {
  IMiddlewareFactory,
  IRegularMiddleware,
  IRequest,
  IResponse,
  INext
} from '../../mware-core/src/interface'

export * from './Mdc'

export default (() => {
  const mdc = new Mdc({})

  return ((req: IRequest, res: IResponse, next: INext) => {
    mdc.contextify(req, res, () => {
      mdc.trace(req, res, () => {})
      next()
    })
  }: IRegularMiddleware)
}: IMiddlewareFactory)
