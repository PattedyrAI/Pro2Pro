import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Callback } from './pages/Callback';
import { Daily } from './pages/Daily';
import { PastDaily } from './pages/PastDaily';
import { Archive } from './pages/Archive';
import { Random } from './pages/Random';
import { Custom } from './pages/Custom';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter basename="/Pro2Pro">
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/daily/:number" element={<ProtectedRoute><PastDaily /></ProtectedRoute>} />
            <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
            <Route path="/random" element={<ProtectedRoute><Random /></ProtectedRoute>} />
            <Route path="/custom" element={<ProtectedRoute><Custom /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
