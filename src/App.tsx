import { PyodideProvider } from './contexts/PyodideProvider'
import PlaygroundContainer from './components/PlaygroundContainer'
import './App.css'

function App() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <PyodideProvider>
        <PlaygroundContainer />
      </PyodideProvider>
    </div>
  )
}

export default App
