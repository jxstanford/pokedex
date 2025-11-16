import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import PokemonDetails from './pages/PokemonDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/pokemon/:id" element={<PokemonDetails />} />
    </Routes>
  );
}

export default App;
