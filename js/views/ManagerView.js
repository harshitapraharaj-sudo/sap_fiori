/**
 * SAP Fiori Manager Module View Controller with Instant & Modal Approvals Engine
 */

class ManagerView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSubTab = 'approvals'; // 'approvals', 'team', 'roster', 'analytics'
  }

  render(subTab = 'approvals') {
    this.currentSubTab = subTab;
    const currentManager = odataService.getCurrentEmployee();
    const teamRequests = odataService.getLeaveRequests({ managerId: currentManager.id });
    const pendingRequests = teamRequests.filter(r => r.status === 'Pending');
    const teamEmployees = odataService.getEmployees().filter(e => e.managerId === currentManager.id);

    this.container.innerHTML = `
      <div class="fiori-section-container">
        <!-- KPI Tiles Header Grid -->
        <div class="fiori-tiles-grid">
          <div class="fiori-tile ${pendingRequests.length > 0 ? 'tile-warning' : 'tile-success'}" onclick="managerView.switchSubTab('approvals')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Pending Approvals</span>
              <div class="fiori-tile-icon"><i class="fas fa-clock"></i></div>
            </div>
            <div class="fiori-tile-value">${pendingRequests.length}</div>
            <div class="fiori-tile-footer"><i class="fas fa-exclamation-circle"></i> Decision required</div>
          </div>

          <div class="fiori-tile tile-info" onclick="managerView.switchSubTab('team')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Direct Team Members</span>
              <div class="fiori-tile-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="fiori-tile-value">${teamEmployees.length}</div>
            <div class="fiori-tile-footer"><i class="fas fa-sitemap"></i> ${currentManager.department}</div>
          </div>

          <div class="fiori-tile tile-success" onclick="managerView.switchSubTab('roster')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Team Attendance Rate</span>
              <div class="fiori-tile-icon"><i class="fas fa-chart-line"></i></div>
            </div>
            <div class="fiori-tile-value">96.8%</div>
            <div class="fiori-tile-footer"><i class="fas fa-check-double"></i> Target met</div>
          </div>

          <div class="fiori-tile tile-info" onclick="managerView.switchSubTab('analytics')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Team Analytics</span>
              <div class="fiori-tile-icon"><i class="fas fa-chart-pie"></i></div>
            </div>
            <div class="fiori-tile-value" style="font-size: 1.25rem;">Overview</div>
            <div class="fiori-tile-footer"><i class="fas fa-search-plus"></i> View charts & insights</div>
          </div>
        </div>

        <!-- Sub-tab Content -->
        <div id="managerSubTabContent">
          ${this.renderSubTabContent(subTab, currentManager, teamRequests, pendingRequests, teamEmployees)}
        </div>
      </div>

      <!-- Global Manager Modal Overlay -->
      <div class="modal-overlay" id="approvalModalOverlay">
        <div class="fiori-dialog">
          <div class="fiori-dialog-header">
            <span class="fiori-dialog-title" id="approvalModalTitle">Process Leave Request</span>
            <button class="close-btn" onclick="managerView.closeApprovalModal()">&times;</button>
          </div>
          <div class="fiori-dialog-body">
            <input type="hidden" id="modalRequestId" />
            <input type="hidden" id="modalActionType" />

            <div id="modalReqDetails" style="margin-bottom: 1.25rem; background: var(--sap-bg-main); padding: 1rem; border-radius: 6px; border: 1px solid var(--sap-card-border);"></div>

            <div class="form-group">
              <label class="form-label">Manager Feedback / Comments</label>
              <textarea class="fiori-control-input" id="modalCommentInput" rows="3" placeholder="Add optional comments for employee..."></textarea>
            </div>
          </div>
          <div class="fiori-dialog-footer">
            <button class="fiori-btn fiori-btn-secondary" onclick="managerView.closeApprovalModal()">Cancel</button>
            <button class="fiori-btn" id="modalSubmitBtn" onclick="managerView.submitApprovalDecision()">Confirm Action</button>
          </div>
        </div>
      </div>
    `;
  }

  switchSubTab(subTab) {
    this.currentSubTab = subTab;
    const currentManager = odataService.getCurrentEmployee();
    const teamRequests = odataService.getLeaveRequests({ managerId: currentManager.id });
    const pendingRequests = teamRequests.filter(r => r.status === 'Pending');
    const teamEmployees = odataService.getEmployees().filter(e => e.managerId === currentManager.id);

    appController.updateNavTabs();

    const contentEl = document.getElementById('managerSubTabContent');
    if (contentEl) {
      contentEl.innerHTML = this.renderSubTabContent(subTab, currentManager, teamRequests, pendingRequests, teamEmployees);
    } else {
      this.render(subTab);
    }
  }

  renderSubTabContent(subTab, currentManager, teamRequests, pendingRequests, teamEmployees) {
    if (subTab === 'team') {
      return this.renderTeamQuotaSection(teamEmployees);
    } else if (subTab === 'roster') {
      return this.renderTeamRosterSection(teamEmployees);
    } else if (subTab === 'analytics') {
      return this.renderAnalyticsSection();
    } else {
      return this.renderApprovalsQueue(pendingRequests, teamRequests);
    }
  }

  renderApprovalsQueue(pendingRequests, teamRequests) {
    const conflictsMap = [];
    if (pendingRequests.length >= 2) {
      for (let i = 0; i < pendingRequests.length; i++) {
        for (let j = i + 1; j < pendingRequests.length; j++) {
          const req1 = pendingRequests[i];
          const req2 = pendingRequests[j];
          const start1 = new Date(req1.startDate);
          const end1 = new Date(req1.endDate);
          const start2 = new Date(req2.startDate);
          const end2 = new Date(req2.endDate);

          if (start1 <= end2 && end1 >= start2) {
            conflictsMap.push({ req1, req2 });
          }
        }
      }
    }

    return `
      ${conflictsMap.length > 0 ? `
        <div class="conflict-banner">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Team Coverage Alert: Schedule Overlap Detected!</strong>
            <p style="font-size: 0.85rem; margin-top: 4px;">
              ${conflictsMap.map(c => `<strong>${c.req1.employeeName}</strong> (${c.req1.startDate}) and <strong>${c.req2.employeeName}</strong> (${c.req2.startDate}) have requested overlapping leave periods. Review project capacity before approving both.`).join('<br/>')}
            </p>
          </div>
        </div>
      ` : ''}

      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-tasks"></i> Pending Team Leave Approvals (${pendingRequests.length})</span>
        </div>
        <div class="fiori-card-body" style="padding: 0;">
          ${pendingRequests.length === 0 ? `
            <div style="padding: 3rem; text-align: center; color: var(--sap-text-muted);">
              <i class="fas fa-check-circle" style="font-size: 2.5rem; color: var(--sap-success-text); margin-bottom: 1rem;"></i>
              <p style="font-weight: 600; font-size: 1rem; color: var(--sap-text-primary);">All Clear!</p>
              <p style="font-size: 0.875rem;">No pending leave approval requests from your team at this time.</p>
            </div>
          ` : `
            <div class="fiori-table-wrapper">
              <table class="fiori-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Applied On</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingRequests.map(r => `
                    <tr>
                      <td>
                        <strong>${r.employeeName}</strong>
                        <div style="font-size: 0.775rem; color: var(--sap-text-muted);">${r.department}</div>
                      </td>
                      <td>${r.leaveType}</td>
                      <td>${r.startDate} to ${r.endDate} ${r.halfDay ? '<span style="color:#d97706; font-size:0.75rem;">(Half)</span>' : ''}</td>
                      <td><strong>${r.daysCount}</strong></td>
                      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.reason}</td>
                      <td>${r.appliedOn}</td>
                      <td style="text-align: right;">
                        <button class="fiori-btn fiori-btn-success fiori-btn-sm" onclick="managerView.quickApprove('${r.requestId}')" title="Approve Request">
                          <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="fiori-btn fiori-btn-danger fiori-btn-sm" onclick="managerView.quickReject('${r.requestId}')" title="Reject Request">
                          <i class="fas fa-times"></i> Reject
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- Processed Requests History -->
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-history"></i> Processed Requests History</span>
        </div>
        <div class="fiori-card-body" style="padding: 0;">
          <div class="fiori-table-wrapper">
            <table class="fiori-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Processed By</th>
                </tr>
              </thead>
              <tbody>
                ${teamRequests.filter(r => r.status !== 'Pending').map(r => `
                  <tr>
                    <td><strong>${r.requestId}</strong></td>
                    <td>${r.employeeName}</td>
                    <td>${r.leaveType}</td>
                    <td>${r.startDate} to ${r.endDate}</td>
                    <td>${r.daysCount}</td>
                    <td>
                      <span class="fiori-status status-${r.status.toLowerCase()}">${r.status}</span>
                    </td>
                    <td>${r.approvedBy || 'Sarah Jenkins'} (${r.approvedDate || r.appliedOn})</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  async quickApprove(requestId) {
    const currentManager = odataService.getCurrentEmployee();
    try {
      await odataService.updateLeaveStatus(requestId, 'Approved', 'Approved by Manager', currentManager.name);
      appController.showToast(`Request ${requestId} approved successfully!`);
      this.switchSubTab('approvals');
    } catch (err) {
      alert(err.message || 'Error approving request');
    }
  }

  async quickReject(requestId) {
    const currentManager = odataService.getCurrentEmployee();
    try {
      await odataService.updateLeaveStatus(requestId, 'Rejected', 'Rejected by Manager', currentManager.name);
      appController.showToast(`Request ${requestId} rejected.`);
      this.switchSubTab('approvals');
    } catch (err) {
      alert(err.message || 'Error rejecting request');
    }
  }

  openApprovalModal(requestId, actionType) {
    const req = odataService.getLeaveRequests().find(r => r.requestId === requestId);
    if (!req) return;

    document.getElementById('modalRequestId').value = requestId;
    document.getElementById('modalActionType').value = actionType;

    const titleEl = document.getElementById('approvalModalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const detailsEl = document.getElementById('modalReqDetails');

    if (actionType === 'Approved') {
      titleEl.textContent = `Approve Leave Request (${requestId})`;
      submitBtn.className = 'fiori-btn fiori-btn-success';
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Approve Leave';
    } else {
      titleEl.textContent = `Reject Leave Request (${requestId})`;
      submitBtn.className = 'fiori-btn fiori-btn-danger';
      submitBtn.innerHTML = '<i class="fas fa-times"></i> Reject Leave';
    }

    detailsEl.innerHTML = `
      <div style="font-weight: 700; font-size: 1rem; color: var(--sap-text-primary);">${req.employeeName} — ${req.leaveType}</div>
      <div style="font-size: 0.85rem; color: var(--sap-text-secondary); margin-top: 4px;">
        <strong>Dates:</strong> ${req.startDate} to ${req.endDate} (${req.daysCount} working days)
      </div>
      <div style="font-size: 0.85rem; color: var(--sap-text-secondary); margin-top: 4px;">
        <strong>Reason:</strong> "${req.reason}"
      </div>
    `;

    const overlay = document.getElementById('approvalModalOverlay');
    if (overlay) overlay.classList.add('active');
  }

  closeApprovalModal() {
    const overlay = document.getElementById('approvalModalOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  async submitApprovalDecision() {
    const requestId = document.getElementById('modalRequestId').value;
    const actionType = document.getElementById('modalActionType').value;
    const comment = document.getElementById('modalCommentInput').value;
    const currentManager = odataService.getCurrentEmployee();

    try {
      await odataService.updateLeaveStatus(requestId, actionType, comment, currentManager.name);
      appController.showToast(`Request ${requestId} successfully ${actionType}!`);
      this.closeApprovalModal();
      this.switchSubTab('approvals');
    } catch (err) {
      alert(err.message || 'Error updating approval status');
    }
  }

  renderTeamQuotaSection(teamEmployees) {
    return `
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-chart-bar"></i> Team Member Leave Quotas & Balances</span>
        </div>
        <div class="fiori-card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
            ${teamEmployees.map(emp => `
              <div style="background: var(--sap-bg-main); border: 1px solid var(--sap-card-border); border-radius: var(--sap-radius-md); padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="avatar-circle">${emp.avatarInitials}</div>
                    <div>
                      <strong style="color: var(--sap-text-primary);">${emp.name}</strong>
                      <div style="font-size: 0.775rem; color: var(--sap-text-secondary);">${emp.role}</div>
                    </div>
                  </div>
                  <span class="fiori-status status-present">${emp.status}</span>
                </div>

                <div style="margin-bottom: 0.75rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                    <span>Annual Leave</span>
                    <strong>${emp.leaveBalance.annual} / ${emp.leaveTotal.annual} Days</strong>
                  </div>
                  <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--sap-brand-blue); height: 100%; width: ${(emp.leaveBalance.annual / emp.leaveTotal.annual) * 100}%;"></div>
                  </div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                    <span>Sick Leave</span>
                    <strong>${emp.leaveBalance.sick} / ${emp.leaveTotal.sick} Days</strong>
                  </div>
                  <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--sap-success-text); height: 100%; width: ${(emp.leaveBalance.sick / emp.leaveTotal.sick) * 100}%;"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderTeamRosterSection(teamEmployees) {
    const days = ['Mon (17)', 'Tue (18)', 'Wed (19)', 'Thu (20)', 'Fri (21)', 'Sat (22)', 'Sun (23)'];

    return `
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-calendar-week"></i> Weekly Team Roster & Availability Grid</span>
          <button class="fiori-btn fiori-btn-secondary fiori-btn-sm" onclick="managerView.exportRosterCSV()">
            <i class="fas fa-file-csv"></i> Export Roster CSV
          </button>
        </div>
        <div class="fiori-card-body" style="padding: 0;">
          <div class="fiori-table-wrapper">
            <table class="fiori-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  ${days.map(d => `<th style="text-align: center;">${d}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${teamEmployees.map(emp => `
                  <tr>
                    <td>
                      <strong>${emp.name}</strong>
                      <div style="font-size: 0.75rem; color: var(--sap-text-muted);">${emp.role}</div>
                    </td>
                    <td style="text-align: center;"><span class="fiori-status status-present">Present</span></td>
                    <td style="text-align: center;"><span class="fiori-status status-present">Present</span></td>
                    <td style="text-align: center;"><span class="fiori-status status-present">Present</span></td>
                    <td style="text-align: center;">
                      ${emp.id === 'EMP001' || emp.id === 'EMP006' ? '<span class="fiori-status status-pending">Requested Leave</span>' : '<span class="fiori-status status-present">Present</span>'}
                    </td>
                    <td style="text-align: center;">
                      ${emp.id === 'EMP001' || emp.id === 'EMP006' ? '<span class="fiori-status status-pending">Requested Leave</span>' : '<span class="fiori-status status-present">Present</span>'}
                    </td>
                    <td style="text-align: center; color: #94a3b8;">Weekend</td>
                    <td style="text-align: center; color: #94a3b8;">Weekend</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderAnalyticsSection() {
    return `
      <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-chart-pie"></i> Leave Distribution by Category</span>
          </div>
          <div class="fiori-card-body" style="text-align: center;">
            <svg width="220" height="220" viewBox="0 0 42 42" class="donut">
              <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
              <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" stroke-width="5"></circle>

              <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0a6ed1" stroke-width="5" stroke-dasharray="55 45" stroke-dashoffset="25"></circle>
              <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#107e3e" stroke-width="5" stroke-dasharray="25 75" stroke-dashoffset="70"></circle>
              <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e69a00" stroke-width="5" stroke-dasharray="20 80" stroke-dashoffset="45"></circle>
            </svg>
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.8rem;">
              <span><i class="fas fa-square" style="color: #0a6ed1;"></i> Annual (55%)</span>
              <span><i class="fas fa-square" style="color: #107e3e;"></i> Sick (25%)</span>
              <span><i class="fas fa-square" style="color: #e69a00;"></i> Casual (20%)</span>
            </div>
          </div>
        </div>

        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-chart-line"></i> 6-Month Team Attendance Trend (%)</span>
          </div>
          <div class="fiori-card-body">
            <svg width="100%" height="200" viewBox="0 0 500 180" style="overflow: visible;">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="4" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#e2e8f0" stroke-dasharray="4" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#e2e8f0" stroke-dasharray="4" />

              <polyline fill="none" stroke="#0a6ed1" stroke-width="4" points="
                60,90
                140,50
                220,65
                300,30
                380,45
                460,25
              " />

              <line x1="40" y1="50" x2="480" y2="50" stroke="#ef4444" stroke-width="2" stroke-dasharray="6" />
              <text x="410" y="45" fill="#ef4444" font-size="10" font-weight="700">Target (95%)</text>

              <text x="55" y="150" font-size="12" fill="#64748b">Mar</text>
              <text x="135" y="150" font-size="12" fill="#64748b">Apr</text>
              <text x="215" y="150" font-size="12" fill="#64748b">May</text>
              <text x="295" y="150" font-size="12" fill="#64748b">Jun</text>
              <text x="375" y="150" font-size="12" fill="#64748b">Jul</text>
              <text x="455" y="150" font-size="12" fill="#64748b">Aug</text>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  exportRosterCSV() {
    const currentManager = odataService.getCurrentEmployee();
    const teamEmployees = odataService.getEmployees().filter(e => e.managerId === currentManager.id);
    let csv = "Employee ID,Name,Role,Department,Status\n";
    teamEmployees.forEach(e => {
      csv += `"${e.id}","${e.name}","${e.role}","${e.department}","${e.status}"\n`;
    });

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `team_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    appController.showToast('Team roster successfully exported as CSV!');
  }
}
