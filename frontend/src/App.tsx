import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import StockInfoPage from './pages/StockInfoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/stocks/:symbol" element={<StockInfoPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
