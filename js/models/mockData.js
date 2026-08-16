/**
 * SAP Fiori Employee Leave & Attendance Management System
 * Initial Mock OData Dataset
 */

const INITIAL_MOCK_DATA = {
  // Current active user profiles for persona switching
  currentUserPersona: 'EMP001', // Default: Employee Alex Morgan

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
      leaveBalance: {
        annual: 14,
        sick: 8,
        casual: 5,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 20,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
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
      leaveBalance: {
        annual: 18,
        sick: 9,
        casual: 6,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 22,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
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
      leaveBalance: {
        annual: 10,
        sick: 6,
        casual: 3,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 20,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
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
      leaveBalance: {
        annual: 12,
        sick: 10,
        casual: 4,
        maternityPaternity: 90
      },
      leaveTotal: {
        annual: 20,
        sick: 10,
        casual: 7,
        maternityPaternity: 90
      },
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
      leaveBalance: {
        annual: 22,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 25,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
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
      leaveBalance: {
        annual: 8,
        sick: 7,
        casual: 2,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 20,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
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
      leaveBalance: {
        annual: 15,
        sick: 9,
        casual: 6,
        maternityPaternity: 0
      },
      leaveTotal: {
        annual: 20,
        sick: 10,
        casual: 7,
        maternityPaternity: 0
      },
      attendanceRate: 98.8,
      status: 'Active'
    }
  ],

  leaveRequests: [
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
      status: 'Pending', // Pending approval by Sarah Jenkins
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
      status: 'Pending', // Overlaps with Alex Morgan's request!
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
    },
    {
      requestId: 'LR-0950',
      employeeId: 'EMP004',
      employeeName: 'Elena Rostova',
      department: 'Product Management',
      leaveType: 'Casual Leave',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      daysCount: 2,
      halfDay: false,
      reason: 'Personal urgent work.',
      status: 'Approved',
      appliedOn: '2026-06-12',
      approvedBy: 'Sarah Jenkins',
      approvedDate: '2026-06-13',
      comments: 'Approved.'
    },
    {
      requestId: 'LR-0920',
      employeeId: 'EMP007',
      employeeName: 'Priya Sharma',
      department: 'Quality Assurance',
      leaveType: 'Annual Leave',
      startDate: '2026-05-02',
      endDate: '2026-05-05',
      daysCount: 4,
      halfDay: false,
      reason: 'Attending family wedding event.',
      status: 'Rejected',
      appliedOn: '2026-04-28',
      approvedBy: 'Sarah Jenkins',
      approvedDate: '2026-04-29',
      comments: 'Sprint release deployment scheduled during these days.'
    }
  ],

  attendanceRecords: [
    { id: 'ATT-001', employeeId: 'EMP001', date: '2026-08-15', checkIn: '08:55 AM', checkOut: '05:30 PM', status: 'Present', workHours: '8.5' },
    { id: 'ATT-002', employeeId: 'EMP001', date: '2026-08-14', checkIn: '09:12 AM', checkOut: '05:45 PM', status: 'Late', workHours: '8.5' },
    { id: 'ATT-003', employeeId: 'EMP001', date: '2026-08-13', checkIn: '08:48 AM', checkOut: '05:15 PM', status: 'Present', workHours: '8.4' },
    { id: 'ATT-004', employeeId: 'EMP001', date: '2026-08-12', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present', workHours: '8.5' },
    { id: 'ATT-005', employeeId: 'EMP001', date: '2026-08-11', checkIn: '08:50 AM', checkOut: '05:20 PM', status: 'Present', workHours: '8.5' },
    { id: 'ATT-006', employeeId: 'EMP002', date: '2026-08-15', checkIn: '08:40 AM', checkOut: '06:00 PM', status: 'Present', workHours: '9.3' },
    { id: 'ATT-007', employeeId: 'EMP003', date: '2026-08-15', checkIn: '09:30 AM', checkOut: '05:30 PM', status: 'Late', workHours: '8.0' },
    { id: 'ATT-008', employeeId: 'EMP006', date: '2026-08-15', checkIn: '08:50 AM', checkOut: '05:25 PM', status: 'Present', workHours: '8.5' }
  ],

  publicHolidays: [
    { date: '2026-01-01', name: 'New Year\'s Day', mandatory: true },
    { date: '2026-01-19', name: 'Martin Luther King Jr. Day', mandatory: true },
    { date: '2026-05-25', name: 'Memorial Day', mandatory: true },
    { date: '2026-07-04', name: 'Independence Day', mandatory: true },
    { date: '2026-09-07', name: 'Labor Day', mandatory: true },
    { date: '2026-11-26', name: 'Thanksgiving Day', mandatory: true },
    { date: '2026-12-25', name: 'Christmas Day', mandatory: true }
  ],

  leaveTypesConfig: [
    { code: 'ANNUAL', name: 'Annual Leave', defaultDays: 20, carryForwardAllowed: true, maxCarryForward: 5, requiresApproval: true },
    { code: 'SICK', name: 'Sick Leave', defaultDays: 10, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: false },
    { code: 'CASUAL', name: 'Casual Leave', defaultDays: 7, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: true },
    { code: 'MATERNITY', name: 'Maternity/Paternity Leave', defaultDays: 90, carryForwardAllowed: false, maxCarryForward: 0, requiresApproval: true }
  ],

  auditLogs: [
    { id: 'LOG-501', timestamp: '2026-08-15 14:30:12', user: 'Kenji Sato', action: 'CREATE_LEAVE_REQUEST', details: 'Submitted LR-1002 (Annual Leave, 3 days)' },
    { id: 'LOG-500', timestamp: '2026-08-14 11:15:00', user: 'Alex Morgan', action: 'CREATE_LEAVE_REQUEST', details: 'Submitted LR-1001 (Annual Leave, 3 days)' },
    { id: 'LOG-499', timestamp: '2026-08-01 09:00:00', user: 'David Miller', action: 'SYSTEM_CONFIG_UPDATE', details: 'Updated Q3 Annual Leave quotas for Tech team.' }
  ]
};
