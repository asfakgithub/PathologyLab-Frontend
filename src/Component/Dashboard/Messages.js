import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar, Checkbox, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './messages.css';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: '', email: '', page: 1, doctorId: '', filterOption: 'All' });
  const debouncedQ = useDebounce(filters.q, 400);
  const [selected, setSelected] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ total: 0, read: 0, unread: 0 });
  const [composeOpen, setComposeOpen] = useState(false);
  const [composePayload, setComposePayload] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '', message: '', recipient: '' });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = { q: debouncedQ, email: filters.email, page: filters.page, doctorId: filters.doctorId, filterOption: filters.filterOption };
      const res = await api.get('/messages', { params });
      // api returns data directly via interceptor
      const { messages: fetched = [], totalPages: tp = 1, readCount = 0, unreadCount = 0, total = 0 } = res || {};
      setMessages(fetched);
      setTotalPages(tp);
      setCounts({ total, read: readCount, unread: unreadCount });
    } catch (err) {
      console.error('fetch messages error', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, filters.page, filters.email, filters.doctorId, filters.filterOption]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMessages();
  }, [fetchMessages, isAuthenticated]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const ids = messages.map(m => m._id);
    setSelected(prev => prev.length === ids.length ? [] : ids);
  };

  const bulkUpdate = async (read) => {
    if (selected.length === 0) return alert('No messages selected');
    try {
      await api.post('/messages/bulk-update', { ids: selected, read });
      setSelected([]);
      fetchMessages();
    } catch (err) { console.error(err); alert('Bulk update failed'); }
  };

  const bulkDelete = async () => {
    if (selected.length === 0) return alert('No messages selected');
    if (!window.confirm(`Delete ${selected.length} messages?`)) return;
    try {
      await api.post('/messages/bulk-delete', { ids: selected });
      setSelected([]);
      fetchMessages();
    } catch (err) { console.error(err); alert('Bulk delete failed'); }
  };

  const sendMessage = async () => {
    try {
      await api.post('/messages', composePayload);
      setComposeOpen(false);
      setComposePayload({ ...composePayload, message: '' });
      fetchMessages();
    } catch (err) { console.error(err); alert('Send failed'); }
  };

  if (!isAuthenticated) return <Typography>Please login to view messages</Typography>;

  return (
    <Box className="messages-root">
      <Paper className="messages-paper" elevation={2}>
        <Box className="messages-header">
          <Typography variant="h5">Messages</Typography>
          <Box>
            <Button variant="contained" startIcon={<SendIcon />} onClick={() => setComposeOpen(true)}>Compose</Button>
          </Box>
        </Box>

        <Box className="messages-controls">
          <TextField size="small" placeholder="Search messages" value={filters.q} onChange={(e) => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))} InputProps={{ endAdornment: <SearchIcon /> }} sx={{ mr: 1, width: 300 }} />
          <TextField size="small" placeholder="Email filter" value={filters.email} onChange={(e) => setFilters(f => ({ ...f, email: e.target.value, page: 1 }))} sx={{ mr: 1 }} />
          <Select size="small" value={filters.filterOption} onChange={(e) => setFilters(f => ({ ...f, filterOption: e.target.value }))} sx={{ mr: 1 }}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Old">Old</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
          </Select>
          <Button variant="outlined" onClick={() => { setFilters({ q: '', email: '', page: 1, doctorId: '', filterOption: 'All' }); }}>Clear</Button>
        </Box>

        <Box className="messages-summary">
          <Typography>Total: {counts.total} | Read: {counts.read} | Unread: {counts.unread}</Typography>
          <Box>
            <Button onClick={() => bulkUpdate(true)} size="small">Mark Read</Button>
            <Button onClick={() => bulkUpdate(false)} size="small">Mark Unread</Button>
            <Button color="error" onClick={bulkDelete} startIcon={<DeleteIcon />}>Delete</Button>
          </Box>
        </Box>

        <List className="messages-list">
          <ListItem divider>
            <Checkbox checked={selected.length > 0 && selected.length === messages.length} onChange={toggleSelectAll} />
            <ListItemText primary={<strong>From / Email</strong>} secondary={<strong>Message</strong>} />
            <Box sx={{ minWidth: 160, textAlign: 'right' }}><strong>Date</strong></Box>
          </ListItem>

          {loading ? (
            <ListItem><ListItemText primary="Loading..." /></ListItem>
          ) : messages.length === 0 ? (
            <ListItem><ListItemText primary="No messages" /></ListItem>
          ) : messages.map(m => (
            <ListItem key={m._id} alignItems="flex-start" className={m.read ? 'message-read' : 'message-unread'}>
              <Checkbox checked={selected.includes(m._id)} onChange={() => toggleSelect(m._id)} />
              <ListItemAvatar>
                <Avatar>{(m.firstName || 'U').charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${m.firstName} ${m.lastName} • ${m.email}`} secondary={<span className="message-preview">{m.message}</span>} />
              <Box sx={{ minWidth: 160, textAlign: 'right' }}>
                <Typography variant="body2">{new Date(m.createdAt || m.sentAt).toLocaleString()}</Typography>
                <Box sx={{ mt: 1 }}>
                  <IconButton size="small" onClick={async () => {
                    const reply = window.prompt('Reply message:');
                    if (!reply) return;
                    try {
                      await api.post('/messages', { firstName: user?.firstName, lastName: user?.lastName, email: user?.email, phone: user?.phone, message: `Re: ${m.message}\n\n${reply}`, recipient: m.recipient?._id || m.recipient });
                      alert('Reply sent');
                      fetchMessages();
                    } catch (err) { console.error(err); alert('Reply failed'); }
                  }}>
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>

        <Box className="messages-pagination">
          <Button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Prev</Button>
          <Typography sx={{ mx: 2 }}>Page {filters.page} / {totalPages}</Typography>
          <Button disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
        </Box>
      </Paper>

      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Compose Message</DialogTitle>
        <DialogContent>
          <TextField fullWidth sx={{ my: 1 }} label="First name" value={composePayload.firstName} onChange={(e) => setComposePayload(p => ({ ...p, firstName: e.target.value }))} />
          <TextField fullWidth sx={{ my: 1 }} label="Last name" value={composePayload.lastName} onChange={(e) => setComposePayload(p => ({ ...p, lastName: e.target.value }))} />
          <TextField fullWidth sx={{ my: 1 }} label="Email" value={composePayload.email} onChange={(e) => setComposePayload(p => ({ ...p, email: e.target.value }))} />
          <TextField fullWidth sx={{ my: 1 }} label="Phone" value={composePayload.phone} onChange={(e) => setComposePayload(p => ({ ...p, phone: e.target.value }))} />
          <TextField fullWidth multiline minRows={4} sx={{ my: 1 }} label="Message" value={composePayload.message} onChange={(e) => setComposePayload(p => ({ ...p, message: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={sendMessage} startIcon={<SendIcon />}>Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
