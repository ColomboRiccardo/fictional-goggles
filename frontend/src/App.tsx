import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Charts } from './pages/Charts'
import { Dashboard } from './pages/Dashboard'
import { Holdings } from './pages/Holdings'
import { StockDetail } from './pages/StockDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
