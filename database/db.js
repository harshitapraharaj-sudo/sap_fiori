/**
 * SAP Fiori Real SQLite Database Engine (Native SQLite3 Driver)
 * File: database/sap_fiori_leave.db
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sap_fiori_leave.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[SQLite] Connection error:', err.message);
  } else {
    console.log('[SQLite] Connected to native SQLite database file:', dbPath);
  }
});

// Initialize Schema and Seed Data synchronously in DB queue
db.serialize(() => {
  // 1. Employees Table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      manager_id TEXT,
      manager_name TEXT,
      join_date TEXT,
      avatar_initials TEXT,
      annual_bal INTEGER DEFAULT 20,
      sick_bal INTEGER DEFAULT 10,
      casual_bal INTEGER DEFAULT 7,
      status TEXT DEFAULT 'Active'
    )
  `);

  // 2. Leave Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      request_id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_count REAL NOT NULL,
      half_day INTEGER DEFAULT 0,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      applied_on TEXT NOT NULL,
      approved_by TEXT,
      approved_date TEXT,
      comments TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
  `);

  // 3. Attendance Records Table
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT,
      work_hours TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
  `);

  // 4. Public Statutory Holidays Table
  db.run(`
    CREATE TABLE IF NOT EXISTS public_holidays (
      date TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mandatory INTEGER DEFAULT 1
    )
  `);

  // 5. Audit Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT
    )
  `);

  // --- Seed Initial SQL Rows if empty ---
  db.get("SELECT COUNT(*) AS cnt FROM employees", (err, row) => {
    if (!err && row && row.cnt === 0) {
      console.log('[SQLite] Seeding initial SQL tables...');
      
      const insertEmp = db.prepare(`
        INSERT INTO employees (id, name, role, department, email, phone, manager_id, manager_name, join_date, avatar_initials, annual_bal, sick_bal, casual_bal, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertEmp.run('EMP001', 'Alex Morgan', 'Sr. Software Engineer', 'Technology & Cloud', 'alex.morgan@company.sap', '+1 (555) 234-5678', 'EMP002', 'Sarah Jenkins', '2021-03-15', 'AM', 14, 8, 5, 'Active');
      insertEmp.run('EMP002', 'Sarah Jenkins', 'Engineering Manager', 'Technology & Cloud', 'sarah.jenkins@company.sap', '+1 (555) 876-5432', 'EMP005', 'David Miller', '2019-06-01', 'SJ', 18, 9, 6, 'Active');
      insertEmp.run('EMP003', 'Marcus Vance', 'Lead UI/UX Architect', 'Design Experience', 'marcus.vance@company.sap', '+1 (555) 345-6789', 'EMP002', 'Sarah Jenkins', '2020-09-10', 'MV', 10, 6, 3, 'Active');
      insertEmp.run('EMP004', 'Elena Rostova', 'Principal Product Manager', 'Product Management', 'elena.rostova@company.sap', '+1 (555) 456-7890', 'EMP002', 'Sarah Jenkins', '2022-01-20', 'ER', 12, 10, 4, 'Active');
      insertEmp.run('EMP005', 'David Miller', 'HR Systems & Admin Lead', 'Human Resources', 'david.miller@company.sap', '+1 (555) 999-0000', 'BOARD', 'Executive Board', '2017-04-12', 'DM', 22, 10, 7, 'Active');
      insertEmp.run('EMP006', 'Kenji Sato', 'Senior Backend Developer', 'Technology & Cloud', 'kenji.sato@company.sap', '+1 (555) 678-9012', 'EMP002', 'Sarah Jenkins', '2021-11-01', 'KS', 8, 7, 2, 'Active');
      insertEmp.run('EMP007', 'Priya Sharma', 'QA Automation Lead', 'Quality Assurance', 'priya.sharma@company.sap', '+1 (555) 789-0123', 'EMP002', 'Sarah Jenkins', '2022-05-15', 'PS', 15, 9, 6, 'Active');
      insertEmp.finalize();

      const insertReq = db.prepare(`
        INSERT INTO leave_requests (request_id, employee_id, employee_name, department, leave_type, start_date, end_date, days_count, half_day, reason, status, applied_on, approved_by, approved_date, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertReq.run('LR-1001', 'EMP001', 'Alex Morgan', 'Technology & Cloud', 'Annual Leave', '2026-08-20', '2026-08-22', 3, 0, 'Family summer vacation to Yosemite National Park.', 'Pending', '2026-08-14', '', '', '');
      insertReq.run('LR-1002', 'EMP006', 'Kenji Sato', 'Technology & Cloud', 'Annual Leave', '2026-08-21', '2026-08-25', 3, 0, 'Attending annual tech conference & travel.', 'Pending', '2026-08-15', '', '', '');
      insertReq.run('LR-0988', 'EMP001', 'Alex Morgan', 'Technology & Cloud', 'Sick Leave', '2026-07-10', '2026-07-11', 2, 0, 'Viral fever and rest doctor advice.', 'Approved', '2026-07-09', 'Sarah Jenkins', '2026-07-09', 'Get well soon Alex!');
      insertReq.finalize();

      const insertHol = db.prepare("INSERT INTO public_holidays (date, name, mandatory) VALUES (?, ?, ?)");
      insertHol.run('2026-01-01', "New Year's Day", 1);
      insertHol.run('2026-05-25', "Memorial Day", 1);
      insertHol.run('2026-07-04', "Independence Day", 1);
      insertHol.run('2026-09-07', "Labor Day", 1);
      insertHol.run('2026-11-26', "Thanksgiving Day", 1);
      insertHol.run('2026-12-25', "Christmas Day", 1);
      insertHol.finalize();

      const insertLog = db.prepare("INSERT INTO audit_logs (id, timestamp, user, action, details) VALUES (?, ?, ?, ?, ?)");
      insertLog.run('LOG-501', '2026-08-15 14:30:12', 'Kenji Sato', 'CREATE_LEAVE_REQUEST', 'Submitted LR-1002 (Annual Leave, 3 days)');
      insertLog.run('LOG-500', '2026-08-14 11:15:00', 'Alex Morgan', 'CREATE_LEAVE_REQUEST', 'Submitted LR-1001 (Annual Leave, 3 days)');
      insertLog.finalize();
    }
  });
});

// Promise-based SQL Query Helper functions
const dbQuery = {
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  }),

  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  }),

  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  })
};

module.exports = dbQuery;
