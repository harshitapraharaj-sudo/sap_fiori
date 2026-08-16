/**
 * SAP Fiori Employee Module View Controller - Robust Async & Validation Engine
 */

class EmployeeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSubTab = 'dashboard';
  }

  render(subTab = 'dashboard') {
    this.currentSubTab = subTab;
    const currentEmp = odataService.getCurrentEmployee();
    const requests = odataService.getLeaveRequests({ employeeId: currentEmp.id });
    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    this.container.innerHTML = `
      <div class="fiori-section-container">
        <!-- KPI Tiles Header Grid -->
        <div class="fiori-tiles-grid">
          <div class="fiori-tile tile-info" onclick="employeeView.switchSubTab('history')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Annual Leave Balance</span>
              <div class="fiori-tile-icon"><i class="fas fa-plane-departure"></i></div>
            </div>
            <div class="fiori-tile-value">${currentEmp.leaveBalance.annual} <span style="font-size: 0.9rem; font-weight: 500;">/ ${currentEmp.leaveTotal.annual} Days</span></div>
            <div class="fiori-tile-footer"><i class="fas fa-info-circle"></i> Carry forward eligible</div>
          </div>

          <div class="fiori-tile tile-warning" onclick="employeeView.switchSubTab('history')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Sick Leave Balance</span>
              <div class="fiori-tile-icon"><i class="fas fa-notes-medical"></i></div>
            </div>
            <div class="fiori-tile-value">${currentEmp.leaveBalance.sick} <span style="font-size: 0.9rem; font-weight: 500;">/ ${currentEmp.leaveTotal.sick} Days</span></div>
            <div class="fiori-tile-footer"><i class="fas fa-info-circle"></i> Medical cert > 2 days</div>
          </div>

          <div class="fiori-tile tile-success" onclick="employeeView.switchSubTab('history')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Casual Leave Balance</span>
              <div class="fiori-tile-icon"><i class="fas fa-mug-hot"></i></div>
            </div>
            <div class="fiori-tile-value">${currentEmp.leaveBalance.casual} <span style="font-size: 0.9rem; font-weight: 500;">/ ${currentEmp.leaveTotal.casual} Days</span></div>
            <div class="fiori-tile-footer"><i class="fas fa-info-circle"></i> Short notice allowed</div>
          </div>

          <div class="fiori-tile tile-info" onclick="employeeView.switchSubTab('attendance')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Monthly Attendance Rate</span>
              <div class="fiori-tile-icon"><i class="fas fa-user-check"></i></div>
            </div>
            <div class="fiori-tile-value">${currentEmp.attendanceRate}%</div>
            <div class="fiori-tile-footer"><i class="fas fa-chart-line"></i> Target: > 95.0%</div>
          </div>

          <div class="fiori-tile ${pendingCount > 0 ? 'tile-warning' : 'tile-info'}" onclick="employeeView.switchSubTab('history')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Pending Requests</span>
              <div class="fiori-tile-icon"><i class="fas fa-clock"></i></div>
            </div>
            <div class="fiori-tile-value">${pendingCount}</div>
            <div class="fiori-tile-footer"><i class="fas fa-history"></i> Manager Approval Queue</div>
          </div>
        </div>

        <!-- Dynamic Subtab Content -->
        <div id="employeeSubTabContent">
          ${this.renderSubTabContent(subTab, currentEmp, requests)}
        </div>
      </div>
    `;

    // Initialize summary calculation after render if on apply form
    if (subTab === 'apply') {
      setTimeout(() => this.updateCalcSummary(), 100);
    }
  }

  switchSubTab(subTab) {
    this.currentSubTab = subTab;
    const currentEmp = odataService.getCurrentEmployee();
    const requests = odataService.getLeaveRequests({ employeeId: currentEmp.id });
    
    appController.updateNavTabs();
    
    const contentEl = document.getElementById('employeeSubTabContent');
    if (contentEl) {
      contentEl.innerHTML = this.renderSubTabContent(subTab, currentEmp, requests);
      if (subTab === 'apply') {
        setTimeout(() => this.updateCalcSummary(), 100);
      }
    } else {
      this.render(subTab);
    }
  }

  renderSubTabContent(subTab, currentEmp, requests) {
    if (subTab === 'apply') {
      return this.renderApplyForm(currentEmp);
    } else if (subTab === 'history') {
      return this.renderHistoryTable(requests);
    } else if (subTab === 'attendance') {
      return this.renderAttendanceSection(currentEmp);
    } else {
      // Default: Dashboard
      return `
        <div class="form-grid" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
          <div class="fiori-card">
            <div class="fiori-card-header">
              <span class="fiori-card-title"><i class="fas fa-list-alt"></i> My Recent Leave Applications</span>
              <button class="fiori-btn fiori-btn-primary fiori-btn-sm" onclick="employeeView.openApplyModal()">
                <i class="fas fa-plus"></i> New Application
              </button>
            </div>
            <div class="fiori-card-body" style="padding: 0;">
              ${this.renderRecentRequestsTable(requests.slice(0, 5))}
            </div>
          </div>

          <div>
            <div class="fiori-card">
              <div class="fiori-card-header">
                <span class="fiori-card-title"><i class="fas fa-business-time"></i> Today's Attendance</span>
              </div>
              <div class="fiori-card-body" style="text-align: center;">
                <div style="font-size: 2.2rem; font-weight: 800; color: var(--sap-brand-blue); margin-bottom: 0.5rem;" id="widgetClock">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p style="font-size: 0.85rem; color: var(--sap-text-secondary); margin-bottom: 1.25rem;">
                  ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div style="display: flex; gap: 10px; justify-content: center;">
                  <button class="fiori-btn fiori-btn-success" onclick="employeeView.handleCheckIn()">
                    <i class="fas fa-sign-in-alt"></i> Check In
                  </button>
                  <button class="fiori-btn fiori-btn-danger" onclick="employeeView.handleCheckOut()">
                    <i class="fas fa-sign-out-alt"></i> Check Out
                  </button>
                </div>
              </div>
            </div>

            <div class="fiori-card">
              <div class="fiori-card-header">
                <span class="fiori-card-title"><i class="fas fa-user-circle"></i> Reporting Line</span>
              </div>
              <div class="fiori-card-body">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="avatar-circle" style="width: 42px; height: 42px; font-size: 1rem;">SJ</div>
                  <div>
                    <div style="font-weight: 700; color: var(--sap-text-primary);">${currentEmp.managerName}</div>
                    <div style="font-size: 0.8rem; color: var(--sap-text-secondary);">Engineering Manager</div>
                    <div style="font-size: 0.775rem; color: var(--sap-brand-blue); margin-top: 2px;">
                      <i class="fas fa-envelope"></i> sarah.jenkins@company.sap
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  renderRecentRequestsTable(reqList) {
    if (reqList.length === 0) {
      return `<div style="padding: 2rem; text-align: center; color: var(--sap-text-muted);">No leave requests found. Click 'New Application' to submit one.</div>`;
    }

    return `
      <div class="fiori-table-wrapper">
        <table class="fiori-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Leave Type</th>
              <th>Period</th>
              <th>Days</th>
              <th>Status</th>
              <th style="text-align: right;">Action / Voucher</th>
            </tr>
          </thead>
          <tbody>
            ${reqList.map(r => `
              <tr>
                <td><strong>${r.requestId}</strong></td>
                <td>${r.leaveType}</td>
                <td>${r.startDate} to ${r.endDate} ${r.halfDay ? '<span style="font-size: 0.75rem; color: #d97706;">(Half Day)</span>' : ''}</td>
                <td><strong>${r.daysCount}</strong></td>
                <td>
                  <span class="fiori-status status-${r.status.toLowerCase()}">
                    <i class="fas ${r.status === 'Approved' ? 'fa-check-circle' : r.status === 'Pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
                    ${r.status}
                  </span>
                </td>
                <td style="text-align: right;">
                  ${r.status === 'Approved' ? `
                    <button class="fiori-btn fiori-btn-secondary fiori-btn-sm" onclick="employeeView.printVoucher('${r.requestId}')" title="Print Approval Voucher">
                      <i class="fas fa-print"></i> Voucher
                    </button>
                  ` : `<span style="font-size: 0.75rem; color: var(--sap-text-muted);">--</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderApplyForm(currentEmp) {
    // Default start date = 3 days from now, end date = 5 days from now
    const now = new Date();
    const defaultStart = new Date(now.setDate(now.getDate() + 3)).toISOString().split('T')[0];
    const defaultEnd = new Date(now.setDate(now.getDate() + 2)).toISOString().split('T')[0];

    return `
      <div class="fiori-card" style="max-width: 800px; margin: 0 auto;">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-file-signature"></i> Create Leave Application</span>
          <span style="font-size: 0.8rem; color: var(--sap-text-muted);">SAP Fiori Smart Form</span>
        </div>
        <div class="fiori-card-body">
          <form id="leaveApplyForm" onsubmit="employeeView.handleFormSubmit(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Leave Category</label>
                <select class="fiori-control-select" id="applyLeaveType" onchange="employeeView.updateCalcSummary()" required>
                  <option value="Annual Leave">Annual Leave (Bal: ${currentEmp.leaveBalance.annual} days)</option>
                  <option value="Sick Leave">Sick Leave (Bal: ${currentEmp.leaveBalance.sick} days)</option>
                  <option value="Casual Leave">Casual Leave (Bal: ${currentEmp.leaveBalance.casual} days)</option>
                  <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Duration Type</label>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
                  <input type="checkbox" id="applyHalfDay" onchange="employeeView.updateCalcSummary()" style="width: 18px; height: 18px;" />
                  <label for="applyHalfDay" style="font-size: 0.875rem; cursor: pointer;">Half Day Leave (0.5 Day)</label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Start Date</label>
                <input type="date" class="fiori-control-input" id="applyStartDate" value="${defaultStart}" onchange="employeeView.updateCalcSummary()" required />
              </div>

              <div class="form-group">
                <label class="form-label required">End Date</label>
                <input type="date" class="fiori-control-input" id="applyEndDate" value="${defaultEnd}" onchange="employeeView.updateCalcSummary()" required />
              </div>

              <div class="form-group full-width">
                <label class="form-label required">Reason for Leave</label>
                <textarea class="fiori-control-input" id="applyReason" rows="3" placeholder="Provide detailed explanation for your manager..." required>Annual family trip and personal vacation.</textarea>
              </div>
            </div>

            <!-- Real-time Day Calculation & Conflict Summary Box -->
            <div id="applyCalcSummary" style="margin-top: 1.25rem; padding: 1rem; background: var(--sap-bg-main); border-radius: var(--sap-radius-sm); border: 1px dashed var(--sap-brand-blue);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 0.85rem; color: var(--sap-text-secondary);">Calculated Net Working Days:</span>
                  <span style="font-size: 1.25rem; font-weight: 800; color: var(--sap-brand-blue); margin-left: 8px;" id="calcDaysDisplay">0 Days</span>
                </div>
                <span style="font-size: 0.775rem; color: var(--sap-text-muted);">(Excludes Weekends & Statutory Public Holidays)</span>
              </div>
              <div id="overlapConflictAlert" style="margin-top: 8px; display: none;"></div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
              <button type="button" class="fiori-btn fiori-btn-secondary" onclick="employeeView.switchSubTab('dashboard')">Cancel</button>
              <button type="submit" class="fiori-btn fiori-btn-primary" id="submitLeaveBtn">
                <i class="fas fa-paper-plane"></i> Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  updateCalcSummary() {
    const startStr = document.getElementById('applyStartDate')?.value;
    const endStr = document.getElementById('applyEndDate')?.value;
    const isHalfDay = document.getElementById('applyHalfDay')?.checked;
    const currentEmp = odataService.getCurrentEmployee();

    if (startStr && endStr) {
      let days = odataService.calculateWorkingDays(startStr, endStr, isHalfDay);
      if (days === 0 && startStr <= endStr) {
        // Minimum 1 day if range selected
        days = isHalfDay ? 0.5 : 1;
      }

      const display = document.getElementById('calcDaysDisplay');
      if (display) display.textContent = `${days} Day${days === 1 ? '' : 's'}`;

      // Check conflicts
      const conflicts = odataService.detectOverlapConflicts(startStr, endStr, currentEmp.id);
      const conflictAlertEl = document.getElementById('overlapConflictAlert');
      if (conflictAlertEl) {
        if (conflicts.length > 0) {
          conflictAlertEl.style.display = 'block';
          conflictAlertEl.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--sap-warning-text); background: var(--sap-warning-bg); padding: 8px; border-radius: 4px; border: 1px solid var(--sap-warning-border);">
              <i class="fas fa-exclamation-triangle"></i> <strong>Coverage Note:</strong> ${conflicts.length} team member(s) (${conflicts.map(c => c.employeeName).join(', ')}) also have requested leave during these dates.
            </div>
          `;
        } else {
          conflictAlertEl.style.display = 'none';
        }
      }
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const leaveType = document.getElementById('applyLeaveType').value;
    const startDate = document.getElementById('applyStartDate').value;
    const endDate = document.getElementById('applyEndDate').value;
    const halfDay = document.getElementById('applyHalfDay').checked;
    const reason = document.getElementById('applyReason').value;

    const submitBtn = document.getElementById('submitLeaveBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }

    try {
      const newReq = await odataService.createLeaveRequest({ leaveType, startDate, endDate, halfDay, reason });
      appController.showToast(`Leave request ${newReq.requestId || 'LR-NEW'} submitted successfully to Manager!`);
      this.switchSubTab('history');
    } catch (err) {
      alert(err.message || 'Error submitting leave request.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
      }
    }
  }

  renderHistoryTable(requests) {
    return `
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-history"></i> Complete Leave History & Tracker</span>
        </div>
        <div class="fiori-card-body">
          <div class="fiori-filterbar">
            <div class="filter-group">
              <span class="filter-label">Filter by Status</span>
              <select class="fiori-control-select" id="historyStatusFilter" onchange="employeeView.filterHistoryTable()">
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="filter-group" style="flex: 1;">
              <span class="filter-label">Search Request</span>
              <input type="text" class="fiori-control-input" id="historySearchInput" placeholder="Search by ID, Leave type, reason..." onkeyup="employeeView.filterHistoryTable()" />
            </div>
          </div>

          <div id="historyTableContainer">
            ${this.renderRecentRequestsTable(requests)}
          </div>
        </div>
      </div>
    `;
  }

  filterHistoryTable() {
    const currentEmp = odataService.getCurrentEmployee();
    const status = document.getElementById('historyStatusFilter')?.value || 'ALL';
    const search = document.getElementById('historySearchInput')?.value || '';

    const filtered = odataService.getLeaveRequests({ employeeId: currentEmp.id, status, search });
    const container = document.getElementById('historyTableContainer');
    if (container) {
      container.innerHTML = this.renderRecentRequestsTable(filtered);
    }
  }

  renderAttendanceSection(currentEmp) {
    const logs = odataService.getAttendanceLogs(currentEmp.id);

    return `
      <div class="form-grid" style="grid-template-columns: 1fr 2fr; gap: 1.5rem;">
        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-user-clock"></i> Daily Time Tracker</span>
          </div>
          <div class="fiori-card-body" style="text-align: center;">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--sap-brand-blue); margin-bottom: 0.5rem;">
              ${new Date().toLocaleTimeString()}
            </div>
            <p style="font-size: 0.85rem; color: var(--sap-text-secondary); margin-bottom: 1.5rem;">
              Simulate daily attendance punch in SAP Fiori Time Management.
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button class="fiori-btn fiori-btn-success" onclick="employeeView.handleCheckIn()">
                <i class="fas fa-sign-in-alt"></i> Punch Check-In Today
              </button>
              <button class="fiori-btn fiori-btn-danger" onclick="employeeView.handleCheckOut()">
                <i class="fas fa-sign-out-alt"></i> Punch Check-Out Today
              </button>
            </div>
          </div>
        </div>

        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-calendar-alt"></i> Attendance Log History</span>
          </div>
          <div class="fiori-card-body" style="padding: 0;">
            <div class="fiori-table-wrapper">
              <table class="fiori-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(log => `
                    <tr>
                      <td><strong>${log.date}</strong></td>
                      <td>${log.checkIn}</td>
                      <td>${log.checkOut}</td>
                      <td>${log.workHours} hrs</td>
                      <td>
                        <span class="fiori-status status-${log.status.toLowerCase()}">
                          ${log.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async handleCheckIn() {
    const currentEmp = odataService.getCurrentEmployee();
    try {
      const rec = await odataService.checkIn(currentEmp.id);
      appController.showToast(`Successfully checked in at ${rec.checkIn}! Status: ${rec.status}`);
      this.switchSubTab(this.currentSubTab);
    } catch (err) {
      alert(err.message);
    }
  }

  async handleCheckOut() {
    const currentEmp = odataService.getCurrentEmployee();
    try {
      const rec = await odataService.checkOut(currentEmp.id);
      appController.showToast(`Checked out at ${rec.checkOut}! Work hours recorded.`);
      this.switchSubTab(this.currentSubTab);
    } catch (err) {
      alert(err.message);
    }
  }

  openApplyModal() {
    this.switchSubTab('apply');
  }

  printVoucher(requestId) {
    const req = odataService.getLeaveRequests().find(r => r.requestId === requestId);
    if (!req) return;

    const printWin = window.open('', '_blank', 'width=700,height=600');
    printWin.document.write(`
      <html>
        <head>
          <title>SAP Leave Approval Voucher - ${req.requestId}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 2rem; color: #1d2d3e; }
            .voucher-header { border-bottom: 3px solid #0a6ed1; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
            .sap-badge { background: #0a6ed1; color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: 800; font-size: 1.2rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
            td, th { padding: 12px; border: 1px solid #cbd5e1; text-align: left; }
            th { background: #f1f5f9; }
            .sign-box { margin-top: 3rem; display: flex; justify-content: space-between; }
            .sign-line { border-top: 1px dashed #64748b; width: 200px; text-align: center; padding-top: 4px; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <div class="voucher-header">
            <div>
              <span class="sap-badge">SAP</span>
              <h2 style="display:inline; margin-left: 10px;">Official Leave Authorization Voucher</h2>
            </div>
            <div>Ref: <strong>${req.requestId}</strong></div>
          </div>

          <p>This document certifies that the following employee leave application has been officially authorized and recorded in the SAP HR OData System.</p>

          <table>
            <tr><th>Employee Name</th><td>${req.employeeName} (${req.employeeId})</td></tr>
            <tr><th>Department</th><td>${req.department}</td></tr>
            <tr><th>Leave Type</th><td>${req.leaveType}</td></tr>
            <tr><th>Duration</th><td>${req.startDate} to ${req.endDate} (${req.daysCount} Working Days)</td></tr>
            <tr><th>Reason</th><td>${req.reason}</td></tr>
            <tr><th>Approval Status</th><td><strong style="color: #107e3e;">${req.status}</strong></td></tr>
            <tr><th>Approved By</th><td>${req.approvedBy || 'Sarah Jenkins'} on ${req.approvedDate || req.appliedOn}</td></tr>
          </table>

          <div class="sign-box">
            <div class="sign-line">Employee Signature</div>
            <div class="sign-line">Manager Signature / SAP Digital Seal</div>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  }
}
