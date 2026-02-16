import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/HomeOld';
import MemberDetail from './pages/MemberDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChallengeDetail from './pages/ChallengeDetail';
import Challenges from './pages/Challenges';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateChallenge from './pages/admin/CreateChallenge';
import EditChallenge from './pages/admin/EditChallenge';
import AdminChallengeList from './pages/admin/AdminChallengeList';
import AdminUserList from './pages/admin/AdminUserList';
import StravaCallback from './pages/StravaCallback';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Forum from './pages/Forum';
import PublicProfile from './pages/PublicProfile';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col relative">
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-slate-800 text-white',
                style: {
                  background: '#1e293b',
                  color: '#fff',
                },
              }}
            />

            <Navbar />
            <main className="flex-grow relative z-10 text-slate-900">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/member/:id" element={<MemberDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/community" element={<Navigate to="/forum" replace />} />
                <Route path="/strava/callback" element={<StravaCallback />} />
                <Route path="/u/:username" element={<PublicProfile />} />

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />}>
                    <Route path="challenges" element={<AdminChallengeList />} />
                    <Route path="challenges/create" element={<CreateChallenge />} />
                    <Route path="challenges/edit/:id" element={<EditChallenge />} />
                    <Route path="users" element={<AdminUserList />} />
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
