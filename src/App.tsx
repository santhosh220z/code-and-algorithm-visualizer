import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage, NotFoundPage } from './pages/CategoryPage';
import { CodeVisualizerPage } from './pages/CodeVisualizerPage';
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
          <Route path="/code" element={<CodeVisualizerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;