import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ScienceIcon from '@mui/icons-material/Science';

function TestTable({ tests, handleOpenDialog, handleDelete }) {
  if (tests.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
        <ScienceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No tests found.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add new tests to see them here.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table aria-label="tests table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell>Sample Type</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell align="center">Fasting Required</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test._id}>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle2" fontWeight="bold">{test.name}</Typography>
                <Typography variant="body2" color="text.secondary">{test.description.slice(0, 50)}...</Typography>
              </TableCell>
              <TableCell>{test.code}</TableCell>
              <TableCell>
                <Chip label={test.category} size="small" variant="outlined" />
              </TableCell>
              <TableCell align="right">₹{test.price}</TableCell>
              <TableCell>{test.sampleType}</TableCell>
              <TableCell>{test.duration ? `${test.duration} hours` : 'N/A'}</TableCell>
              <TableCell align="center">
                {test.fastingRequired ? <Chip label="Yes" size="small" color="warning" /> : <Chip label="No" size="small" color="info" />}
              </TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => handleOpenDialog(test)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(test._id, test.name)} size="small">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TestTable;
