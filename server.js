/**
 * SAP Fiori Express Server with SQLite REST / OData API
 */

const express = require('express');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = 8085;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- REST API Endpoints connected to SQLite DB ---

// 1. Employee Endpoints
app.get('/api/employees', (req, res) => {
  const { query, department } = req.query;
  let employees = db.getEmployees();

  if (query) {
    const q = query.toLowerCase();
    employees = employees.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
  }
  if (department && department !== 'ALL') {
    employees = employees.filter(e => e.department === department);
  }

  res.json({ status: 'success', data: employees });
});

app.get('/api/employees/:id', (req, res) => {
  const emp = db.getEmployee(req.params.id);
  if (!emp) return res.status(404).json({ status: 'error', message: 'Employee not found' });
  res.json({ status: 'success', data: emp });
});

app.post('/api/employees', (req, res) => {
  try {
    const newEmp = db.createEmployee(req.body);
    res.json({ status: 'success', data: newEmp });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/employees/:id', (req, res) => {
  const updated = db.updateEmployee(req.params.id, req.body);
  if (!updated) return res.status(404).json({ status: 'error', message: 'Employee not found' });
  res.json({ status: 'success', data: updated });
});

app.delete('/api/employees/:id', (req, res) => {
  const success = db.deleteEmployee(req.params.id);
  if (!success) return res.status(404).json({ status: 'error', message: 'Employee not found' });
  res.json({ status: 'success', message: 'Employee deleted' });
});

// 2. Leave Request Endpoints
app.get('/api/leave-requests', (req, res) => {
  const { employeeId, managerId, status } = req.query;
  let requests = db.getLeaveRequests();

  if (employeeId) {
    requests = requests.filter(r => r.employeeId === employeeId);
  }
  if (managerId) {
    const teamEmpIds = db.getEmployees().filter(e => e.managerId === managerId).map(e => e.id);
    requests = requests.filter(r => teamEmpIds.includes(r.employeeId));
  }
  if (status && status !== 'ALL') {
    requests = requests.filter(r => r.status === status);
  }

  res.json({ status: 'success', data: requests });
});

app.post('/api/leave-requests', (req, res) => {
  try {
    const newReq = db.createLeaveRequest(req.body);
    res.json({ status: 'success', data: newReq });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/leave-requests/:id/status', (req, res) => {
  const { status, comments, approvedBy } = req.body;
  try {
    const updated = db.updateLeaveStatus(req.params.id, status, comments, approvedBy);
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. Attendance Endpoints
app.get('/api/attendance/:employeeId', (req, res) => {
  const logs = db.getAttendanceLogs().filter(a => a.employeeId === req.params.employeeId);
  res.json({ status: 'success', data: logs });
});

app.post('/api/attendance/check-in', (req, res) => {
  try {
    const record = db.checkIn(req.body.employeeId);
    res.json({ status: 'success', data: record });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

app.post('/api/attendance/check-out', (req, res) => {
  try {
    const record = db.checkOut(req.body.employeeId);
    res.json({ status: 'success', data: record });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// 4. Audit Logs & Config Endpoints
app.get('/api/audit-logs', (req, res) => {
  res.json({ status: 'success', data: db.getAuditLogs() });
});

app.get('/api/public-holidays', (req, res) => {
  res.json({ status: 'success', data: db.getPublicHolidays() });
});

app.get('/api/leave-types', (req, res) => {
  res.json({ status: 'success', data: db.getLeaveTypes() });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`SAP Fiori Leave App Server running on http://localhost:${PORT}`);
  console.log(`SQLite DB persistent storage location: ./database/sap_fiori_leave.json`);
  console.log(`=======================================================`);
});
