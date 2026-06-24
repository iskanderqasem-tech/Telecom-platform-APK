import { useEffect, useState } from 'react';
import { Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Box, TextField, MenuItem } from '@mui/material';
import api from '../api/client.js';

export default function Executions() {
  const [executions, setExecutions] = useState([]);
  const [cases, setCases] = useState([]);
  const [devices, setDevices] = useState([]);
  const [testCaseId, setTestCaseId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const load = () => api.get('/api/executions').then(r => setExecutions(r.data.data));
  useEffect(() => { load(); api.get('/api/testcases').then(r=>{setCases(r.data.data); setTestCaseId(r.data.data[0]?.id||'')}); api.get('/api/devices').then(r=>{setDevices(r.data.data); setDeviceId(r.data.data[0]?.id||'')}); }, []);
  const run = async () => { await api.post('/api/executions', { testCaseId, deviceIds: deviceId ? [deviceId] : [] }); load(); };
  return <>
    <Typography variant="h4" gutterBottom>Executions</Typography>
    <Paper sx={{ p:2, mb:2 }}>
      <Typography variant="h6">Run Test</Typography>
      <Box sx={{ display:'grid', gridTemplateColumns:'2fr 2fr auto', gap:2, mt:2 }}>
        <TextField select label="Test Case" value={testCaseId} onChange={e=>setTestCaseId(e.target.value)}>{cases.map(t=><MenuItem key={t.id} value={t.id}>{t.test_name}</MenuItem>)}</TextField>
        <TextField select label="Device" value={deviceId} onChange={e=>setDeviceId(e.target.value)}>{devices.map(d=><MenuItem key={d.id} value={d.id}>{d.device_label} ({d.status})</MenuItem>)}</TextField>
        <Button variant="contained" onClick={run}>Run</Button>
      </Box>
    </Paper>
    <Paper><Table><TableHead><TableRow><TableCell>Test</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell></TableRow></TableHead><TableBody>
      {executions.map(e => <TableRow key={e.id}><TableCell>{e.test_name}</TableCell><TableCell>{e.test_type}</TableCell><TableCell>{e.execution_status}</TableCell><TableCell>{e.start_time}</TableCell><TableCell>{e.end_time}</TableCell></TableRow>)}
    </TableBody></Table></Paper>
  </>;
}
