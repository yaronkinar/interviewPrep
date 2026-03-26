import UseFetchDemo from './UseFetchDemo'
import UseDebounceDemo from './UseDebounceDemo'
import UseCallbackDemo from './UseCallbackDemo'
import UseRefDemo from './UseRefDemo'
import LazyLoadThrottleDemo from './LazyLoadThrottleDemo'
import EventLoopDemo from './EventLoopDemo'

export default function ReactPage() {
  return (
    <>
      <h1 className="page-title">React Questions</h1>
      <div className="grid">
        <UseFetchDemo />
        <UseDebounceDemo />
        <UseCallbackDemo />
        <UseRefDemo />
        <LazyLoadThrottleDemo />
        <EventLoopDemo />
      </div>
    </>
  )
}
