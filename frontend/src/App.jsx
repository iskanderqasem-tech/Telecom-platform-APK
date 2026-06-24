import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Devices from './pages/Devices.jsx';
import TestCases from './pages/TestCases.jsx';
import Executions from './pages/Executions.jsx';
import Results from './pages/Results.jsx';
import Reports from './pages/Reports.jsx';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); navigate('/login'); };
  return <>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Telecom Test Platform</Typography>
        <Button color="inherit" component={Link} to="/">Dashboard</Button>
        <Button color="inherit" component={Link} to="/devices">Devices</Button>
        <Button color="inherit" component={Link} to="/testcases">Test Cases</Button>
        <Button color="inherit" component={Link} to="/executions">Executions</Button>
        <Button color="inherit" component={Link} to="/results">Results</Button>
        <Button color="inherit" component={Link} to="/reports">Reports</Button>
        <Button color="inherit" onClick={logout}>Logout</Button>
      </Toolbar>
    </AppBar>
    <Container maxWidth="xl"><Box sx={{ mt: 3 }}>{children}</Box></Container>
  </>;
}

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/devices" element={<PrivateRoute><Layout><Devices /></Layout></PrivateRoute>} />
      <Route path="/testcases" element={<PrivateRoute><Layout><TestCases /></Layout></PrivateRoute>} />
      <Route path="/executions" element={<PrivateRoute><Layout><Executions /></Layout></PrivateRoute>} />
      <Route path="/results" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
    </Routes>
  </BrowserRouter>;
}
