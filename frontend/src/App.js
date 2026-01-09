import React, { useState, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/Auth";
import BookingsPage from "./pages/Bookings";
import EventsPage from "./pages/Events";
import MainNavigation from "./components/Navigation/MainNavigation";
import AuthContext from "./context/auth-context";

import "./App.css";

function ProtectedRoute({ children }) {
  const auth = useContext(AuthContext);
  return auth.token ? children : <Navigate to="/auth" replace />;
}

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = (tokenValue, userIdValue /*, tokenExpiration */) => {
    setToken(tokenValue);
    setUserId(userIdValue);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          token: token,
          userId: userId,
          login: login,
          logout: logout,
        }}
      >
        <MainNavigation />
        <main className="main-content">
          <Routes>
            <Route
              path="/auth"
              element={token ? <Navigate to="/events" replace /> : <AuthPage />}
            />
            <Route path="/events" element={<EventsPage />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to={token ? "/events" : "/auth"} replace />}
            />
            <Route
              path="*"
              element={<Navigate to={token ? "/events" : "/auth"} replace />}
            />
          </Routes>
        </main>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
