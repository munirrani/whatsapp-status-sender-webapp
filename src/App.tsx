import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TypeStatus from './TypeStatus';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* The home route for TypeStatus */}
        <Route path="/" element={<TypeStatus />} />
      </Routes>
    </Router>
  );
}
