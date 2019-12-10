import factory, {DEFAULT_SPACE_ID, TRACE_KEY} from '../src'
import reqresnext from 'reqresnext'

describe('mware-mdc', () => {
  it('index reexports Mdc inners', () => {
    expect(DEFAULT_SPACE_ID).toBe('mdc')
    expect(TRACE_KEY).toBe('trace')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('factory returns a middleware', () => {
    expect(factory()).toEqual(expect.any(Function))
  })

  it('composes `mdc.proto.contextify()` and `.trace()`', () => {
    const mware = factory({})
    const {req, res, next} = reqresnext(null, null, jest.fn())

    mware(req, res, next)

    expect(res.get('x-b3-traceid')).toMatch(/^[0-9a-f]{16}$/)
    expect(res.get('x-b3-spanid')).toMatch(/^[0-9a-f]{16}$/)
    expect(res.get('x-b3-parentspanid')).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })

  it('attaches req.trace field and passes through inner async context', done => {
    const mware = factory({})
    const {req, res} = reqresnext()
    const delayed = (req) => new Promise(resolve => setTimeout(() => resolve(req.trace), 200))
    const inner = () => {
      expect(req.trace).toMatchObject({
        trace_id: expect.stringMatching(/^[0-9a-f]{16}$/),
        span_id: expect.stringMatching(/^[0-9a-f]{16}$/),
      })

      delayed(req)
        .then(trace => {
          expect(trace).toMatchObject({
            trace_id: expect.stringMatching(/^[0-9a-f]{16}$/),
            span_id: expect.stringMatching(/^[0-9a-f]{16}$/),
          })
        })
        .then(() => done())
    }
    mware(req, res, inner)

    expect(req.trace).toBeUndefined()
  })
})
