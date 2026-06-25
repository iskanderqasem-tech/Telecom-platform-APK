import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Alert } from '@mui/material';
import api from '../api/client.js';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return <Container maxWidth="sm">
    <Box sx={{ mt: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>Telecom Test Platform</Typography>
          <Typography color="text.secondary" gutterBottom>Login to create telecom test cases and run executions.</Typography>
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={login} sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="contained" type="submit">Login</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  </Container>;
}
