import React from 'react';
import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import api from '../api/client.js';

export default function Dashboard() {
  const [summary, setSummary] = useState({ devices: [], executions: [], results: [] });
  useEffect(() => { api.get('/api/reports/summary').then(r => setSummary(r.data.data)); }, []);
  const sum = arr => arr.reduce((a,b)=>a+b.count,0);
  return <>
    <Typography variant="h4" gutterBottom>Dashboard</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Devices</Typography><Typography variant="h3">{sum(summary.devices)}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Executions</Typography><Typography variant="h3">{sum(summary.executions)}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Results</Typography><Typography variant="h3">{sum(summary.results)}</Typography></CardContent></Card></Grid>
    </Grid>
  </>;
}
