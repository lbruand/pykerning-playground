import { PyodideProvider } from './contexts/PyodideProvider'
import PlaygroundContainer from './components/PlaygroundContainer'
import './App.css'

function App() {
  return (
    <PyodideProvider>
      <PlaygroundContainer />
    </PyodideProvider>
  )
}

export default App
