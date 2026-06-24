import { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import api from '../api/client.js';

export default function Results() {
  const [results, setResults] = useState([]);
  useEffect(() => { api.get('/api/results').then(r => setResults(r.data.data)); }, []);
  return <>
    <Typography variant="h4" gutterBottom>Results</Typography>
    <Paper><Table><TableHead><TableRow><TableCell>Test</TableCell><TableCell>Type</TableCell><TableCell>Device</TableCell><TableCell>Status</TableCell><TableCell>Actual</TableCell><TableCell>Log</TableCell><TableCell>Created</TableCell></TableRow></TableHead><TableBody>
      {results.map(r => <TableRow key={r.id}><TableCell>{r.test_name}</TableCell><TableCell>{r.test_type}</TableCell><TableCell>{r.device_label || '-'}</TableCell><TableCell>{r.result_status}</TableCell><TableCell>{r.actual_result}</TableCell><TableCell>{r.execution_log}</TableCell><TableCell>{r.created_at}</TableCell></TableRow>)}
    </TableBody></Table></Paper>
  </>;
}
