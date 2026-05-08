import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import CountriesQuiz from './CountriesQuiz'
import AnimalGame from './AnimalGame'
import BalanceGame from './BalanceGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countrystudy" element={<CountriesQuiz />} />
        <Route path="/animals" element={<AnimalGame />} />
        <Route path="/balance" element={<BalanceGame />} />
      </Routes>
    </BrowserRouter>
  )
}
