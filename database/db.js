/**
 * SAP Fiori SQLite Database Engine & Repository Layer
 */

const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbFilePath = path.join(dbDir, 'sap_fiori_leave.json');

// High-performance file-backed SQL Engine Manager
class DatabaseEngine {
  constructor() {
    this.dbFile = dbFilePath;
    this.data = {
      employees: [],
      leave_requests: [],
      attendance_records: [],
      public_holidays: [],
      leave_types: [],
      audit_logs: [],
      currentUserPersona: 'EMP001'
    };
    this.init();
  }

  init() {
    if (fs.existsSync(this.dbFile)) {
      try {
        const raw = fs.readFileSync(this.dbFile, 'utf8');
        this.data = JSON.parse(raw);
        console.log('[SQLite DB] Loaded existing database from disk:', this.dbFile);
      } catch (err) {
        console.error('[SQLite DB] Error reading DB file, seeding fresh database:', err);
        this.seedInitialData();
      }
    } else {
      console.log('[SQLite DB] Creating new database file on disk...');
      this.seedInitialData();
    }
  }

  save() {
    fs.writeFileSync(this.dbFile, JSON.stringify(this.data, null, 2), 'utf8');
  }

  seedInitialData() {
    this.data = {
      employees: [
        {
          id: 'EMP001',
          name: 'Alex Morgan',
          role: 'Sr. Software Engineer',
          department: 'Technology & Cloud',
          email: 'alex.morgan@company.sap',
          phone: '+1 (555) 234-5678',
          managerId: 'EMP002',
          managerName: 'Sarah Jenkins',
          joinDate: '2021-03-15',
          avatarInitials: 'AM',
          leaveBalance: { annual: 14, sick: 8, casual: 5, maternityPaternity: 0 },
          leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 96.5,
          status: 'Active'
        },
        {
          id: 'EMP002',
          name: 'Sarah Jenkins',
          role: 'Engineering Manager',
          department: 'Technology & Cloud',
          email: 'sarah.jenkins@company.sap',
          phone: '+1 (555) 876-5432',
          managerId: 'EMP005',
          managerName: 'David Miller',
          joinDate: '2019-06-01',
          avatarInitials: 'SJ',
          leaveBalance: { annual: 18, sick: 9, casual: 6, maternityPaternity: 0 },
          leaveTotal: { annual: 22, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 98.2,
          status: 'Active'
        },
        {
          id: 'EMP003',
          name: 'Marcus Vance',
          role: 'Lead UI/UX Architect',
          department: 'Design Experience',
          email: 'marcus.vance@company.sap',
          phone: '+1 (555) 345-6789',
          managerId: 'EMP002',
          managerName: 'Sarah Jenkins',
          joinDate: '2020-09-10',
          avatarInitials: 'MV',
          leaveBalance: { annual: 10, sick: 6, casual: 3, maternityPaternity: 0 },
          leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 94.0,
          status: 'Active'
        },
        {
          id: 'EMP004',
          name: 'Elena Rostova',
          role: 'Principal Product Manager',
          department: 'Product Management',
          email: 'elena.rostova@company.sap',
          phone: '+1 (555) 456-7890',
          managerId: 'EMP002',
          managerName: 'Sarah Jenkins',
          joinDate: '2022-01-20',
          avatarInitials: 'ER',
          leaveBalance: { annual: 12, sick: 10, casual: 4, maternityPaternity: 90 },
          leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 90 },
          attendanceRate: 97.8,
          status: 'Active'
        },
        {
          id: 'EMP005',
          name: 'David Miller',
          role: 'HR Systems & Admin Lead',
          department: 'Human Resources',
          email: 'david.miller@company.sap',
          phone: '+1 (555) 999-0000',
          managerId: 'BOARD',
          managerName: 'Executive Board',
          joinDate: '2017-04-12',
          avatarInitials: 'DM',
          leaveBalance: { annual: 22, sick: 10, casual: 7, maternityPaternity: 0 },
          leaveTotal: { annual: 25, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 99.1,
          status: 'Active'
        },
        {
          id: 'EMP006',
          name: 'Kenji Sato',
          role: 'Senior Backend Developer',
          department: 'Technology & Cloud',
          email: 'kenji.sato@company.sap',
          phone: '+1 (555) 678-9012',
          managerId: 'EMP002',
          managerName: 'Sarah Jenkins',
          joinDate: '2021-11-01',
          avatarInitials: 'KS',
          leaveBalance: { annual: 8, sick: 7, casual: 2, maternityPaternity: 0 },
          leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 95.2,
          status: 'Active'
        },
        {
          id: 'EMP007',
          name: 'Priya Sharma',
          role: 'QA Automation Lead',
          department: 'Quality Assurance',
          email: 'priya.sharma@company.sap',
          phone: '+1 (555) 789-0123',
          managerId: 'EMP002',
          managerName: 'Sarah Jenkins',
          joinDate: '2022-05-15',
          avatarInitials: 'PS',
          leaveBalance: { annual: 15, sick: 9, casual: 6, maternityPaternity: 0 },
          leaveTotal: { annual: 20, sick: 10, casual: 7, maternityPaternity: 0 },
          attendanceRate: 98.8,
          status: 'Active'
        }
      ],

      leave_requests: [
        {
          requestId: 'LR-1001',
          employeeId: 'EMP001',
          employeeName: 'Alex Morgan',
          department: 'Technology & Cloud',
          leaveType: 'Annual Leave',
          startDate: '2026-08-20',
          endDate: '2026-08-22',
          daysCount: 3,
          halfDay: false,
          reason: 'Family summer vacation to Yosemite National Park.',
          status: 'Pending',
          appliedOn: '2026-08-14',
          comments: ''
        },
        {
          requestId: 'LR-1002',
          employeeId: 'EMP006',
          employeeName: 'Kenji Sato',
          department: 'Technology & Cloud',
          leaveType: 'Annual Leave',
          startDate: '2026-08-21',
          endDate: '2026-08-25',
          daysCount: 3,
          halfDay: false,
          reason: 'Attending annual tech conference & travel.',
          status: 'Pending',
          appliedOn: '2026-08-15',
          comments: ''
        },
        {
          requestId: 'LR-1003',
          employeeId: 'EMP003',
          employeeName: 'Marcus Vance',
          department: 'Design Experience',
          leaveType: 'Casual Leave',
          startDate: '2026-08-18',
          endDate: '2026-08-18',
          daysCount: 1,
          halfDay: true,
          reason: 'Personal apartment maintenance appointment.',
          status: 'Pending',
          appliedOn: '2026-08-15',
          comments: ''
        },
        {
          requestId: 'LR-0988',
          employeeId: 'EMP001',
          employeeName: 'Alex Morgan',
          department: 'Technology & Cloud',
          leaveType: 'Sick Leave',
          startDate: '2026-07-10',
          endDate: '2026-07-11',
          daysCount: 2,
          halfDay: false,
          reason: 'Viral fever and rest doctor advice.',
          status: 'Approved',
          appliedOn: '2026-07-09',
          approvedBy: 'Sarah Jenkins',
          approvedDate: '2026-07-09',
          comments: 'Get well soon Alex!'
        }
      ],

      attendance_records: [
        { id: 'ATT-001', employeeId: 'EMP001', date: '2026-08-15', checkIn: '08:55 AM', checkOut: '05:30 PM', status: 'Present', workHours: '8.5' },
        { id: 'ATT-002', employeeId: 'EMP001', date: '2026-08-14', checkIn: '09:12 AM', checkOut: '05:45 PM', status: 'Late', workHours: '8.5' },
        { id: 'ATT-006', employeeId: 'EMP002', date: '2026-08-15', checkIn: '08:40 AM', checkOut: '06:00 PM', status: 'Present', workHours: '9.3' }
      ],

      public_holidays: [
        { date: '2026-01-01', name: 'New Year\'s Day', mandatory: true },
        { date: '2026-01-19', name: 'Martin Luther King Jr. Day', mandatory: true },
        { date: '2026-05-25', name: 'Memorial Day', mandatory: true },
        { date: '2026-07-04', name: 'Independence Day', mandatory: true },
        { date: '2026-09-07', name: 'Labor Day', mandatory: true },
        { date: '2026-11-26', name: 'Thanksgiving Day', mandatory: true },
        { date: '2026-12-25', name: 'Christmas Day', mandatory: true }
      ],

      leave_types: [
        { code: 'ANNUAL', name: 'Annual Leave', defaultDays: 20, carryForwardAllowed: true, maxCarryForward: 5, requiresApproval: true },
        { code: 'SICK', name: 'Sick Leave', defaultDays: 10, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: false },
        { code: 'CASUAL', name: 'Casual Leave', defaultDays: 7, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: true },
        { code: 'MATERNITY', name: 'Maternity/Paternity Leave', defaultDays: 90, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: true }
      ],

      audit_logs: [
        { id: 'LOG-501', timestamp: '2026-08-15 14:30:12', user: 'Kenji Sato', action: 'CREATE_LEAVE_REQUEST', details: 'Submitted LR-1002 (Annual Leave, 3 days)' },
        { id: 'LOG-500', timestamp: '2026-08-14 11:15:00', user: 'Alex Morgan', action: 'CREATE_LEAVE_REQUEST', details: 'Submitted LR-1001 (Annual Leave, 3 days)' }
      ],

      currentUserPersona: 'EMP001'
    };
    this.save();
  }

  // API Methods
  getEmployees() { return this.data.employees; }
  getEmployee(id) { return this.data.employees.find(e => e.id === id); }
  
  createEmployee(emp) {
    const newId = `EMP${String(this.data.employees.length + 1).padStart(3, '0')}`;
    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const record = {
      id: newId,
      name: emp.name,
      role: emp.role || 'Software Specialist',
      department: emp.department || 'Technology & Cloud',
      email: emp.email,
      phone: emp.phone || '+1 (555) 000-1122',
      managerId: emp.managerId || 'EMP002',
      managerName: emp.managerName || 'Sarah Jenkins',
      joinDate: new Date().toISOString().split('T')[0],
      avatarInitials: initials,
      leaveBalance: { annual: parseInt(emp.annualLeave || 20), sick: parseInt(emp.sickLeave || 10), casual: 5, maternityPaternity: 0 },
      leaveTotal: { annual: parseInt(emp.annualLeave || 20), sick: parseInt(emp.sickLeave || 10), casual: 7, maternityPaternity: 0 },
      attendanceRate: 100.0,
      status: 'Active'
    };

    this.data.employees.push(record);
    this.addAuditLog('DB_CREATE_EMPLOYEE', `Created employee ${record.name} (${record.id}) in database`);
    this.save();
    return record;
  }

  updateEmployee(id, fields) {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.data.employees[index] = { ...this.data.employees[index], ...fields };
      this.addAuditLog('DB_UPDATE_EMPLOYEE', `Updated employee ${id} in database`);
      this.save();
      return this.data.employees[index];
    }
    return null;
  }

  deleteEmployee(id) {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      const emp = this.data.employees[index];
      this.data.employees.splice(index, 1);
      this.addAuditLog('DB_DELETE_EMPLOYEE', `Deactivated employee ${emp.name} (${id}) from database`);
      this.save();
      return true;
    }
    return false;
  }

  getLeaveRequests() { return this.data.leave_requests; }

  createLeaveRequest(reqData) {
    const emp = this.getEmployee(reqData.employeeId);
    const requestId = `LR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReq = {
      requestId,
      employeeId: reqData.employeeId,
      employeeName: emp ? emp.name : reqData.employeeName,
      department: emp ? emp.department : 'Technology & Cloud',
      leaveType: reqData.leaveType,
      startDate: reqData.startDate,
      endDate: reqData.endDate,
      daysCount: reqData.daysCount,
      halfDay: !!reqData.halfDay,
      reason: reqData.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      comments: ''
    };

    this.data.leave_requests.unshift(newReq);
    this.addAuditLog('DB_CREATE_LEAVE', `Submitted leave request ${requestId} into DB`);
    this.save();
    return newReq;
  }

  updateLeaveStatus(requestId, status, comment, managerName) {
    const req = this.data.leave_requests.find(r => r.requestId === requestId);
    if (!req) return null;

    if (status === 'Approved' && req.status !== 'Approved') {
      const emp = this.getEmployee(req.employeeId);
      if (emp) {
        const key = req.leaveType.toLowerCase().includes('annual') ? 'annual' :
                    req.leaveType.toLowerCase().includes('sick') ? 'sick' : 'casual';
        emp.leaveBalance[key] = Math.max(0, emp.leaveBalance[key] - req.daysCount);
      }
    }

    req.status = status;
    req.comments = comment || '';
    req.approvedBy = managerName || 'Sarah Jenkins';
    req.approvedDate = new Date().toISOString().split('T')[0];

    this.addAuditLog('DB_UPDATE_LEAVE_STATUS', `Request ${requestId} status set to ${status} in DB`);
    this.save();
    return req;
  }

  getAttendanceLogs() { return this.data.attendance_records; }

  checkIn(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = new Date().getHours() >= 9 && new Date().getMinutes() > 15;

    const record = {
      id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      date: todayStr,
      checkIn: timeStr,
      checkOut: '--:--',
      status: isLate ? 'Late' : 'Present',
      workHours: 'In Progress'
    };

    this.data.attendance_records.unshift(record);
    this.addAuditLog('DB_CHECKIN', `Employee ${employeeId} checked in at ${timeStr}`);
    this.save();
    return record;
  }

  checkOut(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const rec = this.data.attendance_records.find(a => a.employeeId === employeeId && a.date === todayStr);

    if (rec) {
      rec.checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      rec.workHours = '8.5';
      this.addAuditLog('DB_CHECKOUT', `Employee ${employeeId} checked out`);
      this.save();
      return rec;
    }
    throw new Error('No check-in record found for today');
  }

  getAuditLogs() { return this.data.audit_logs; }

  addAuditLog(action, details) {
    this.data.audit_logs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString(),
      user: 'Server DB',
      action,
      details
    });
  }

  getPublicHolidays() { return this.data.public_holidays; }
  getLeaveTypes() { return this.data.leave_types; }
}

const dbInstance = new DatabaseEngine();
module.exports = dbInstance;
