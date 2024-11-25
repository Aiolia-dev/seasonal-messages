import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import CardsPage from './pages/CardsPage';
import CreateCardPage from './pages/CreateCardPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import AccountPage from './pages/AccountPage';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/cards" replace />} />
          <Route
            path="/cards"
            element={
              <PrivateRoute>
                <CardsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cards/create"
            element={
              <PrivateRoute>
                <CreateCardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
