/**
 * SAP Fiori OData Service Layer - Connected to Server Database API
 */

class MockODataService {
  constructor() {
    this.storageKey = 'sap_fiori_leave_mgmt_db_v1';
    this.subscribers = [];
    this.useServerApi = true;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        console.log('[OData Service] Connected to Live Server Database API.');
        await this.syncFromDB();
        return;
      }
    } catch (e) {
      console.warn('[OData Service] Server API unreachable, using local storage fallback:', e);
    }
    
    // Fallback to local storage
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.db = JSON.parse(saved);
    } else {
      this.db = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
      this.saveLocal();
    }
  }

  async syncFromDB() {
    try {
      const [empRes, reqRes, logRes, holRes] = await Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/leave-requests').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/public-holidays').then(r => r.json())
      ]);

      this.db = {
        currentUserPersona: this.db ? this.db.currentUserPersona : 'EMP001',
        employees: empRes.data || [],
        leaveRequests: reqRes.data || [],
        attendanceRecords: this.db ? this.db.attendanceRecords : INITIAL_MOCK_DATA.attendanceRecords,
        publicHolidays: holRes.data || INITIAL_MOCK_DATA.publicHolidays,
        leaveTypesConfig: INITIAL_MOCK_DATA.leaveTypesConfig,
        auditLogs: logRes.data || []
      };

      this.saveLocal();
      this.notifySubscribers();
    } catch (err) {
      console.error('[OData Service] Error syncing from database API:', err);
    }
  }

  saveLocal() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.db));
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.db));
  }

  getCurrentPersonaId() {
    return this.db ? (this.db.currentUserPersona || 'EMP001') : 'EMP001';
  }

  getCurrentEmployee() {
    const id = this.getCurrentPersonaId();
    return this.getEmployees().find(e => e.id === id) || (this.db ? this.db.employees[0] : INITIAL_MOCK_DATA.employees[0]);
  }

  setPersona(employeeId) {
    if (!this.db) return;
    this.db.currentUserPersona = employeeId;
    this.saveLocal();
  }

  // --- Employees ---
  getEmployees(query = '', department = 'ALL') {
    if (!this.db || !this.db.employees) return INITIAL_MOCK_DATA.employees;
    return this.db.employees.filter(emp => {
      const matchQuery = !query || 
        emp.name.toLowerCase().includes(query.toLowerCase()) || 
        emp.id.toLowerCase().includes(query.toLowerCase()) ||
        emp.role.toLowerCase().includes(query.toLowerCase());
      const matchDept = department === 'ALL' || emp.department === department;
      return matchQuery && matchDept;
    });
  }

  getEmployeeById(id) {
    return this.getEmployees().find(e => e.id === id);
  }

  async addEmployee(empData) {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        await this.syncFromDB();
        return data.data;
      }
    } catch (e) {
      console.error('API Error adding employee:', e);
    }
    
    // Fallback sync
    const newId = `EMP${String(this.db.employees.length + 1).padStart(3, '0')}`;
    const initials = empData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const newEmp = {
      id: newId, name: empData.name, role: empData.role, department: empData.department,
      email: empData.email, phone: '+1 (555) 000-1122', managerId: 'EMP002', managerName: 'Sarah Jenkins',
      joinDate: new Date().toISOString().split('T')[0], avatarInitials: initials,
      leaveBalance: { annual: parseInt(empData.annualLeave || 20), sick: parseInt(empData.sickLeave || 10), casual: 5, maternityPaternity: 0 },
      leaveTotal: { annual: parseInt(empData.annualLeave || 20), sick: parseInt(empData.sickLeave || 10), casual: 7, maternityPaternity: 0 },
      attendanceRate: 100.0, status: 'Active'
    };
    this.db.employees.push(newEmp);
    this.saveLocal();
    return newEmp;
  }

  async updateEmployee(id, updatedFields) {
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      await this.syncFromDB();
      return true;
    } catch (e) {
      console.error('API Error updating employee:', e);
    }

    const empIndex = this.db.employees.findIndex(e => e.id === id);
    if (empIndex !== -1) {
      this.db.employees[empIndex] = { ...this.db.employees[empIndex], ...updatedFields };
      this.saveLocal();
      return true;
    }
    return false;
  }

  async deleteEmployee(id) {
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      await this.syncFromDB();
      return true;
    } catch (e) {
      console.error('API Error deleting employee:', e);
    }

    this.db.employees = this.db.employees.filter(e => e.id !== id);
    this.saveLocal();
    return true;
  }

  // --- Public Holidays ---
  getPublicHolidays() {
    return (this.db && this.db.publicHolidays) ? this.db.publicHolidays : INITIAL_MOCK_DATA.publicHolidays;
  }

  // --- Leave Operations ---
  getLeaveRequests(filters = {}) {
    if (!this.db || !this.db.leaveRequests) return INITIAL_MOCK_DATA.leaveRequests;
    let requests = [...this.db.leaveRequests];

    if (filters.employeeId) {
      requests = requests.filter(r => r.employeeId === filters.employeeId);
    }
    if (filters.managerId) {
      const teamEmpIds = this.getEmployees().filter(e => e.managerId === filters.managerId).map(e => e.id);
      requests = requests.filter(r => teamEmpIds.includes(r.employeeId));
    }
    if (filters.status && filters.status !== 'ALL') {
      requests = requests.filter(r => r.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      requests = requests.filter(r => 
        r.employeeName.toLowerCase().includes(q) ||
        r.leaveType.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q)
      );
    }

    return requests.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  }

  calculateWorkingDays(startDateStr, endDateStr, isHalfDay = false) {
    if (isHalfDay) return 0.5;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    const holidays = this.getPublicHolidays().map(h => h.date);
    let count = 0;
    const cur = new Date(start);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      const isoDate = cur.toISOString().split('T')[0];
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(isoDate)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  detectOverlapConflicts(startDateStr, endDateStr, currentEmployeeId) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    return this.getLeaveRequests().filter(req => {
      if (req.employeeId === currentEmployeeId) return false;
      if (req.status === 'Rejected') return false;

      const reqStart = new Date(req.startDate);
      const reqEnd = new Date(req.endDate);

      return (start <= reqEnd && end >= reqStart);
    });
  }

  async createLeaveRequest(data) {
    const currentEmp = this.getCurrentEmployee();
    const daysCount = this.calculateWorkingDays(data.startDate, data.endDate, data.halfDay);

    if (daysCount <= 0) {
      throw new Error('Invalid date range. Start date must be before or equal to End date and include working days.');
    }

    const payload = {
      ...data,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      daysCount
    };

    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        await this.syncFromDB();
        return resData.data;
      }
    } catch (e) {
      console.error('API Error submitting leave:', e);
    }

    // Local fallback
    const requestId = `LR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      requestId,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      department: currentEmp.department,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount,
      halfDay: !!data.halfDay,
      reason: data.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    this.db.leaveRequests.unshift(newReq);
    this.saveLocal();
    return newReq;
  }

  async updateLeaveStatus(requestId, newStatus, comments = '', managerName = 'Sarah Jenkins') {
    try {
      const res = await fetch(`/api/leave-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comments, approvedBy: managerName })
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        await this.syncFromDB();
        return resData.data;
      }
    } catch (e) {
      console.error('API Error updating leave status:', e);
    }

    const req = this.db.leaveRequests.find(r => r.requestId === requestId);
    if (!req) throw new Error('Leave request not found');

    const emp = this.getEmployeeById(req.employeeId);
    if (newStatus === 'Approved' && req.status !== 'Approved' && emp) {
      const key = req.leaveType.toLowerCase().includes('annual') ? 'annual' :
                  req.leaveType.toLowerCase().includes('sick') ? 'sick' : 'casual';
      emp.leaveBalance[key] = Math.max(0, emp.leaveBalance[key] - req.daysCount);
    }

    req.status = newStatus;
    req.comments = comments;
    req.approvedBy = managerName;
    req.approvedDate = new Date().toISOString().split('T')[0];

    this.saveLocal();
    return req;
  }

  // --- Attendance ---
  getAttendanceLogs(employeeId) {
    if (!this.db || !this.db.attendanceRecords) return [];
    return this.db.attendanceRecords.filter(a => a.employeeId === employeeId);
  }

  async checkIn(employeeId) {
    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        if (!this.db.attendanceRecords) this.db.attendanceRecords = [];
        this.db.attendanceRecords.unshift(resData.data);
        this.saveLocal();
        return resData.data;
      } else {
        throw new Error(resData.message);
      }
    } catch (e) {
      if (e.message.includes('already checked in')) throw e;
    }

    // Fallback
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const record = {
      id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId, date: todayStr, checkIn: timeStr, checkOut: '--:--', status: 'Present', workHours: 'In Progress'
    };
    if (!this.db.attendanceRecords) this.db.attendanceRecords = [];
    this.db.attendanceRecords.unshift(record);
    this.saveLocal();
    return record;
  }

  async checkOut(employeeId) {
    try {
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        await this.syncFromDB();
        return resData.data;
      }
    } catch (e) {
      console.error('Check-out API error:', e);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const rec = this.db.attendanceRecords.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!rec) throw new Error('No active Check-In record found for today.');
    rec.checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    rec.workHours = '8.5';
    this.saveLocal();
    return rec;
  }

  getAuditLogs() {
    return (this.db && this.db.auditLogs) ? this.db.auditLogs : INITIAL_MOCK_DATA.auditLogs;
  }

  getLeaveTypesConfig() {
    return INITIAL_MOCK_DATA.leaveTypesConfig;
  }
}

const odataService = new MockODataService();
