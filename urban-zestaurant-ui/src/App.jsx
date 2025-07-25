import { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import SideNavbar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import { AuthContext, AuthProvider } from './context/AuthContext';
import AddUser from './pages/AddUser';
import Billing from './pages/Billing';
import KDS from './pages/KDS'
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Register from './pages/Register';
import Tables from './pages/Table';
import './styles/navbar.css';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      // minHeight: '100vh', 
      backgroundColor: '#f8fffe',
    }}>
      <TopNavbar />
      <div style={{ display: 'flex', paddingTop: '55px' }}> {/* Updated to match new navbar height */}
        <SideNavbar />
        <main style={{ 
          marginLeft: '160px',
          flex: 1,
          minHeight: 'calc(100vh - 55px)', /* Updated calculation */
          overflow: 'auto',
          transition: 'margin-left 0.3s ease',
          padding: '0',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tables" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
                <Tables />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/menu" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Menu />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
                <Orders />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/billing" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
                <Billing />
              </ProtectedRoute>
            } 
          />


            <Route 
            path="/kds" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
                <KDS />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/add-user" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AddUser />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirect to dashboard if authenticated, login if not */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;