import React from 'react';
import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import api from '../api/client.js';

export default function Reports() {
  const [summary, setSummary] = useState({ devices: [], executions: [], results: [] });
  useEffect(() => { api.get('/api/reports/summary').then(r => setSummary(r.data.data)); }, []);
  return <>
    <Typography variant="h4" gutterBottom>Reports</Typography>
    <Grid container spacing={2}>
      {['devices','executions','results'].map(section => <Grid item xs={12} md={4} key={section}><Card><CardContent><Typography variant="h6">{section.toUpperCase()}</Typography>{summary[section].map(x => <Typography key={Object.values(x).join('-')}>{Object.values(x).join(': ')}</Typography>)}</CardContent></Card></Grid>)}
    </Grid>
  </>;
}
