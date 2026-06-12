import { ModelProvider } from './state/ModelProvider'
import { Scrollytelling } from './scroll/Scrollytelling'

export default function App() {
  return (
    <ModelProvider>
      <Scrollytelling />
    </ModelProvider>
  )
}
