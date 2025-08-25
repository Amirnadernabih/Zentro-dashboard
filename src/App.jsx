/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Navbar from "./components/Navbar";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Summary from "./pages/Summary";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login"; 

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Splash delay (e.g., 2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          user ? (
            <>
              <Navbar onLogout={() => signOut(auth)} />
              <Routes>
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="*" element={<Navigate to="/summary" />} />
              </Routes>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default route after splash */}
      <Route path="*" element={<Navigate to={user ? "/summary" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
