import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import './algos/sorting';
import './algos/search';
import './algos/graph';
import './algos/grid';
import './algos/ds';
import './algos/dp';
import './algos/recursion';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/algo/:category" element={<CategoryPage />} />
          <Route path="/algo/:category/:id" element={null} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;