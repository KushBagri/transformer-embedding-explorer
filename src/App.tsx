import { ModelProvider } from './state/ModelProvider'
import { Scrollytelling } from './scroll/Scrollytelling'
import { Background } from './ui/Background'
import { ScrollProgress } from './ui/ScrollProgress'

export default function App() {
  return (
    <ModelProvider>
      <Background />
      <ScrollProgress />
      <Scrollytelling />
    </ModelProvider>
  )
}
