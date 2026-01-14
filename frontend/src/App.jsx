import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MemberDetail from './pages/MemberDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChallengeDetail from './pages/ChallengeDetail';
import Challenges from './pages/Challenges';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateChallenge from './pages/admin/CreateChallenge';
import EditChallenge from './pages/admin/EditChallenge';
import AdminChallengeList from './pages/admin/AdminChallengeList';
import StravaCallback from './pages/StravaCallback';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Forum from './pages/Forum';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen text-white selection:bg-cyan-500 selection:text-white flex flex-col relative overflow-hidden">
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-slate-800 text-white border border-white/10',
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }}
            />
            {/* Background Effects */}
            <div className="bg-noise"></div>
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-blob"></div>
              <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            <Navbar />
            <main className="flex-grow relative z-10 text-white">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/member/:id" element={<MemberDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/community" element={<Navigate to="/forum" replace />} />
                <Route path="/strava/callback" element={<StravaCallback />} />

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />}>
                    <Route path="challenges" element={<AdminChallengeList />} />
                    <Route path="challenges/create" element={<CreateChallenge />} />
                    <Route path="challenges/edit/:id" element={<EditChallenge />} />
                  </Route>
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
