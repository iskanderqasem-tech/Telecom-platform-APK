import React from 'react';
import { useEffect, useState } from 'react';
import { Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Box, MenuItem } from '@mui/material';
import api from '../api/client.js';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ deviceLabel:'Test Phone A', deviceIdentifier:'phone-a', msisdn:'+64210000001', manufacturer:'Samsung', model:'S24', androidVersion:'15', networkOperator:'2degrees' });
  const load = () => api.get('/api/devices').then(r => setDevices(r.data.data));
  useEffect(load, []);
  const create = async () => { await api.post('/api/devices', form); load(); };
  return <>
    <Typography variant="h4" gutterBottom>Devices</Typography>
    <Paper sx={{ p:2, mb:2 }}>
      <Typography variant="h6">Register Device</Typography>
      <Box sx={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:2, mt:2 }}>
        {Object.keys(form).map(k => <TextField key={k} label={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />)}
      </Box>
      <Button sx={{ mt:2 }} variant="contained" onClick={create}>Add Device</Button>
    </Paper>
    <Paper><Table><TableHead><TableRow><TableCell>Label</TableCell><TableCell>Identifier</TableCell><TableCell>MSISDN</TableCell><TableCell>Model</TableCell><TableCell>Status</TableCell><TableCell>Last Seen</TableCell></TableRow></TableHead><TableBody>
      {devices.map(d => <TableRow key={d.id}><TableCell>{d.device_label}</TableCell><TableCell>{d.device_identifier}</TableCell><TableCell>{d.msisdn}</TableCell><TableCell>{d.manufacturer} {d.model}</TableCell><TableCell>{d.status}</TableCell><TableCell>{d.last_seen}</TableCell></TableRow>)}
    </TableBody></Table></Paper>
  </>;
}
