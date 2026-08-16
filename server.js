/**
 * SAP Fiori Express Server connected to Native SQLite3 Database
 */

const express = require('express');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = 8085;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Helper for mapping DB row to JS employee format
const formatEmp = (row) => row ? ({
  id: row.id,
  name: row.name,
  role: row.role,
  department: row.department,
  email: row.email,
  phone: row.phone,
  managerId: row.manager_id,
  managerName: row.manager_name,
  joinDate: row.join_date,
  avatarInitials: row.avatar_initials,
  leaveBalance: { annual: row.annual_bal, sick: row.sick_bal, casual: row.casual_bal, maternityPaternity: 0 },
  leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 0 },
  attendanceRate: 98.0,
  status: row.status
}) : null;

// Helper for mapping DB row to JS request format
const formatReq = (row) => row ? ({
  requestId: row.request_id,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  department: row.department,
  leaveType: row.leave_type,
  startDate: row.start_date,
  endDate: row.end_date,
  daysCount: row.days_count,
  halfDay: Boolean(row.half_day),
  reason: row.reason,
  status: row.status,
  appliedOn: row.applied_on,
  approvedBy: row.approved_by || '',
  approvedDate: row.approved_date || '',
  comments: row.comments || ''
}) : null;

// --- 1. Employee SQL API Endpoints ---
app.get('/api/employees', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM employees ORDER BY id ASC");
    res.json({ status: 'success', data: rows.map(formatEmp) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const row = await db.get("SELECT * FROM employees WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ status: 'error', message: 'Employee not found' });
    res.json({ status: 'success', data: formatEmp(row) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const countRow = await db.get("SELECT COUNT(*) AS total FROM employees");
    const newId = `EMP${String((countRow ? countRow.total : 0) + 1).padStart(3, '0')}`;
    const initials = req.body.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    await db.run(`
      INSERT INTO employees (id, name, role, department, email, phone, manager_id, manager_name, join_date, avatar_initials, annual_bal, sick_bal, casual_bal, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId, req.body.name, req.body.role || 'Staff Engineer', req.body.department || 'Technology & Cloud',
      req.body.email, req.body.phone || '+1 (555) 000-1122', req.body.managerId || 'EMP002', req.body.managerName || 'Sarah Jenkins',
      new Date().toISOString().split('T')[0], initials, parseInt(req.body.annualLeave || 20), parseInt(req.body.sickLeave || 10), 5, 'Active'
    ]);

    await db.run("INSERT INTO audit_logs (id, timestamp, user, action, details) VALUES (?, ?, ?, ?, ?)", [
      `LOG-${Math.floor(1000 + Math.random() * 9000)}`, new Date().toLocaleString(), 'Admin', 'SQL_CREATE_EMPLOYEE', `Inserted ${req.body.name} (${newId}) into SQLite DB`
    ]);

    const created = await db.get("SELECT * FROM employees WHERE id = ?", [newId]);
    res.json({ status: 'success', data: formatEmp(created) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, role, department, email } = req.body;
    await db.run(`
      UPDATE employees SET name = ?, role = ?, department = ?, email = ? WHERE id = ?
    `, [name, role, department, email, req.params.id]);

    const updated = await db.get("SELECT * FROM employees WHERE id = ?", [req.params.id]);
    res.json({ status: 'success', data: formatEmp(updated) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.run("DELETE FROM employees WHERE id = ?", [req.params.id]);
    res.json({ status: 'success', message: 'Employee deleted from SQLite DB' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- 2. Leave Requests SQL API Endpoints ---
app.get('/api/leave-requests', async (req, res) => {
  try {
    const { employeeId, managerId, status } = req.query;
    let sql = "SELECT * FROM leave_requests WHERE 1=1";
    const params = [];

    if (employeeId) {
      sql += " AND employee_id = ?";
      params.push(employeeId);
    }
    if (status && status !== 'ALL') {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY applied_on DESC";
    const rows = await db.all(sql, params);
    res.json({ status: 'success', data: rows.map(formatReq) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/leave-requests', async (req, res) => {
  try {
    const requestId = `LR-${Math.floor(1000 + Math.random() * 9000)}`;
    const emp = await db.get("SELECT * FROM employees WHERE id = ?", [req.body.employeeId]);

    await db.run(`
      INSERT INTO leave_requests (request_id, employee_id, employee_name, department, leave_type, start_date, end_date, days_count, half_day, reason, status, applied_on, approved_by, approved_date, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      requestId, req.body.employeeId, emp ? emp.name : req.body.employeeName, emp ? emp.department : 'Technology & Cloud',
      req.body.leaveType, req.body.startDate, req.body.endDate, req.body.daysCount, req.body.halfDay ? 1 : 0,
      req.body.reason, 'Pending', new Date().toISOString().split('T')[0], '', '', ''
    ]);

    await db.run("INSERT INTO audit_logs (id, timestamp, user, action, details) VALUES (?, ?, ?, ?, ?)", [
      `LOG-${Math.floor(1000 + Math.random() * 9000)}`, new Date().toLocaleString(), emp ? emp.name : 'Employee', 'SQL_CREATE_LEAVE', `Inserted request ${requestId} into SQLite DB`
    ]);

    const created = await db.get("SELECT * FROM leave_requests WHERE request_id = ?", [requestId]);
    res.json({ status: 'success', data: formatReq(created) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/leave-requests/:id/status', async (req, res) => {
  try {
    const { status, comments, approvedBy } = req.body;
    const reqRow = await db.get("SELECT * FROM leave_requests WHERE request_id = ?", [req.params.id]);
    
    if (status === 'Approved' && reqRow && reqRow.status !== 'Approved') {
      const emp = await db.get("SELECT * FROM employees WHERE id = ?", [reqRow.employee_id]);
      if (emp) {
        const leaveKey = reqRow.leave_type.toLowerCase().includes('annual') ? 'annual_bal' :
                         reqRow.leave_type.toLowerCase().includes('sick') ? 'sick_bal' : 'casual_bal';
        const newBal = Math.max(0, (emp[leaveKey] || 0) - reqRow.days_count);
        await db.run(`UPDATE employees SET ${leaveKey} = ? WHERE id = ?`, [newBal, emp.id]);
      }
    }

    await db.run(`
      UPDATE leave_requests SET status = ?, comments = ?, approved_by = ?, approved_date = ? WHERE request_id = ?
    `, [status, comments || '', approvedBy || 'Sarah Jenkins', new Date().toISOString().split('T')[0], req.params.id]);

    const updated = await db.get("SELECT * FROM leave_requests WHERE request_id = ?", [req.params.id]);
    res.json({ status: 'success', data: formatReq(updated) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- 3. Attendance SQL Endpoints ---
app.get('/api/attendance/:employeeId', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM attendance_records WHERE employee_id = ? ORDER BY date DESC", [req.params.employeeId]);
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/attendance/check-in', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = new Date().getHours() >= 9 && new Date().getMinutes() > 15;
    const attId = `ATT-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.run(`
      INSERT INTO attendance_records (id, employee_id, date, check_in, check_out, status, work_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [attId, req.body.employeeId, todayStr, timeStr, '--:--', isLate ? 'Late' : 'Present', 'In Progress']);

    const rec = await db.get("SELECT * FROM attendance_records WHERE id = ?", [attId]);
    res.json({ status: 'success', data: rec });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/attendance/check-out', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await db.run(`
      UPDATE attendance_records SET check_out = ?, work_hours = '8.5' WHERE employee_id = ? AND date = ?
    `, [timeStr, req.body.employeeId, todayStr]);

    const rec = await db.get("SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?", [req.body.employeeId, todayStr]);
    res.json({ status: 'success', data: rec });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- 4. Audit & Config Endpoints ---
app.get('/api/audit-logs', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50");
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/public-holidays', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM public_holidays ORDER BY date ASC");
    res.json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`SAP Fiori SQLite Database Express Server Running at http://localhost:${PORT}`);
  console.log(`Native SQLite File Path: ./database/sap_fiori_leave.db`);
  console.log(`=======================================================`);
});
