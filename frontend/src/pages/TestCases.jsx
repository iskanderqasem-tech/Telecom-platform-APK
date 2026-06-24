import { useEffect, useState } from 'react';
import { Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Box, MenuItem } from '@mui/material';
import api from '../api/client.js';

const types = ['VOICE_CALL','SMS','DATA','VoLTE','VoWiFi','IMS','ROAMING','ONE_NUMBER','CALL_FORWARDING','CALL_WAITING','CONFERENCE_CALL'];

export default function TestCases() {
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({ testName:'MO Voice Call Test', testType:'VOICE_CALL', description:'Dial target number and validate call.', expectedResult:'Call placed successfully', configuration:'{"targetNumber":"+64210000002","durationSeconds":10}' });
  const load = () => api.get('/api/testcases').then(r => setCases(r.data.data));
  useEffect(load, []);
  const create = async () => {
    let configuration = {};
    try { configuration = JSON.parse(form.configuration || '{}'); } catch { alert('Configuration must be valid JSON'); return; }
    await api.post('/api/testcases', { ...form, configuration });
    load();
  };
  return <>
    <Typography variant="h4" gutterBottom>Test Cases</Typography>
    <Paper sx={{ p:2, mb:2 }}>
      <Typography variant="h6">Create Test Case</Typography>
      <Box sx={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:2, mt:2 }}>
        <TextField label="Test Name" value={form.testName} onChange={e=>setForm({...form,testName:e.target.value})} />
        <TextField select label="Test Type" value={form.testType} onChange={e=>setForm({...form,testType:e.target.value})}>{types.map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
        <TextField label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <TextField label="Expected Result" value={form.expectedResult} onChange={e=>setForm({...form,expectedResult:e.target.value})} />
        <TextField label="Configuration JSON" multiline minRows={4} value={form.configuration} onChange={e=>setForm({...form,configuration:e.target.value})} sx={{ gridColumn:'1 / -1' }} />
      </Box>
      <Button sx={{ mt:2 }} variant="contained" onClick={create}>Create Test Case</Button>
    </Paper>
    <Paper><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Description</TableCell><TableCell>Expected</TableCell></TableRow></TableHead><TableBody>
      {cases.map(tc => <TableRow key={tc.id}><TableCell>{tc.test_name}</TableCell><TableCell>{tc.test_type}</TableCell><TableCell>{tc.description}</TableCell><TableCell>{tc.expected_result}</TableCell></TableRow>)}
    </TableBody></Table></Paper>
  </>;
}
