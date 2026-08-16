/**
 * SAP Fiori Administrator Module View Controller
 */

class AdminView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSubTab = 'employees'; // 'employees', 'policies', 'audit'
  }

  render(subTab = 'employees') {
    this.currentSubTab = subTab;
    const employees = odataService.getEmployees();
    const auditLogs = odataService.getAuditLogs();
    const leaveTypes = odataService.getLeaveTypesConfig();
    const holidays = odataService.getPublicHolidays();

    this.container.innerHTML = `
      <div class="fiori-section-container">
        <!-- KPI Tiles Header Grid -->
        <div class="fiori-tiles-grid">
          <div class="fiori-tile tile-info" onclick="adminView.switchSubTab('employees')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Total Active Employees</span>
              <div class="fiori-tile-icon"><i class="fas fa-users-cog"></i></div>
            </div>
            <div class="fiori-tile-value">${employees.length}</div>
            <div class="fiori-tile-footer"><i class="fas fa-database"></i> Registered users</div>
          </div>

          <div class="fiori-tile tile-success" onclick="adminView.switchSubTab('policies')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">Configured Leave Types</span>
              <div class="fiori-tile-icon"><i class="fas fa-cogs"></i></div>
            </div>
            <div class="fiori-tile-value">${leaveTypes.length}</div>
            <div class="fiori-tile-footer"><i class="fas fa-sliders-h"></i> Active policy rules</div>
          </div>

          <div class="fiori-tile tile-warning" onclick="adminView.switchSubTab('audit')">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">System Event Logs</span>
              <div class="fiori-tile-icon"><i class="fas fa-shield-alt"></i></div>
            </div>
            <div class="fiori-tile-value">${auditLogs.length}</div>
            <div class="fiori-tile-footer"><i class="fas fa-list-ol"></i> Audit trail recorded</div>
          </div>

          <div class="fiori-tile tile-info" onclick="adminView.exportDataJSON()">
            <div class="fiori-tile-header">
              <span class="fiori-tile-title">System Backup / Export</span>
              <div class="fiori-tile-icon"><i class="fas fa-download"></i></div>
            </div>
            <div class="fiori-tile-value" style="font-size: 1.25rem;">JSON / CSV</div>
            <div class="fiori-tile-footer"><i class="fas fa-file-export"></i> Click to download</div>
          </div>
        </div>

        <!-- Subtab Content Container -->
        <div id="adminSubTabContent">
          ${this.renderSubTabContent(subTab, employees, leaveTypes, auditLogs, holidays)}
        </div>
      </div>
    `;
  }

  switchSubTab(subTab) {
    this.currentSubTab = subTab;
    const employees = odataService.getEmployees();
    const auditLogs = odataService.getAuditLogs();
    const leaveTypes = odataService.getLeaveTypesConfig();
    const holidays = odataService.getPublicHolidays();

    appController.updateNavTabs();

    const contentEl = document.getElementById('adminSubTabContent');
    if (contentEl) {
      contentEl.innerHTML = this.renderSubTabContent(subTab, employees, leaveTypes, auditLogs, holidays);
    } else {
      this.render(subTab);
    }
  }

  renderSubTabContent(subTab, employees, leaveTypes, auditLogs, holidays) {
    if (subTab === 'policies') {
      return this.renderPoliciesSection(leaveTypes, holidays);
    } else if (subTab === 'audit') {
      return this.renderAuditSection(auditLogs);
    } else {
      // Default: Employee CRUD Directory
      return this.renderEmployeesSection(employees);
    }
  }

  renderEmployeesSection(employees) {
    return `
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-user-friends"></i> Employee Directory & CRUD Management</span>
          <button class="fiori-btn fiori-btn-primary" onclick="adminView.openAddEmployeeModal()">
            <i class="fas fa-user-plus"></i> Add New Employee
          </button>
        </div>
        <div class="fiori-card-body">
          <!-- Smart FilterBar -->
          <div class="fiori-filterbar">
            <div class="filter-group" style="flex: 1;">
              <span class="filter-label">Search Employees</span>
              <input type="text" class="fiori-control-input" id="adminSearchEmp" placeholder="Search by name, ID, role..." onkeyup="adminView.filterEmployees()" />
            </div>

            <div class="filter-group">
              <span class="filter-label">Department</span>
              <select class="fiori-control-select" id="adminDeptFilter" onchange="adminView.filterEmployees()">
                <option value="ALL">All Departments</option>
                <option value="Technology & Cloud">Technology & Cloud</option>
                <option value="Design Experience">Design Experience</option>
                <option value="Product Management">Product Management</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>
          </div>

          <div id="adminEmpTableContainer">
            ${this.renderEmployeesTable(employees)}
          </div>
        </div>
      </div>

      <!-- Add / Edit Employee Modal -->
      <div class="modal-overlay" id="empModalOverlay">
        <div class="fiori-dialog">
          <div class="fiori-dialog-header">
            <span class="fiori-dialog-title" id="empModalTitle">Add New Employee</span>
            <button class="close-btn" onclick="adminView.closeEmpModal()">&times;</button>
          </div>
          <div class="fiori-dialog-body">
            <form id="empForm" onsubmit="adminView.handleEmpFormSubmit(event)">
              <input type="hidden" id="empFormEditId" />

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">Full Name</label>
                  <input type="text" class="fiori-control-input" id="empFormName" required placeholder="e.g. Jane Doe" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Job Role</label>
                  <input type="text" class="fiori-control-input" id="empFormRole" required placeholder="e.g. Cloud Engineer" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Department</label>
                  <select class="fiori-control-select" id="empFormDept" required>
                    <option value="Technology & Cloud">Technology & Cloud</option>
                    <option value="Design Experience">Design Experience</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label required">Email</label>
                  <input type="email" class="fiori-control-input" id="empFormEmail" required placeholder="jane.doe@company.sap" />
                </div>

                <div class="form-group">
                  <label class="form-label">Annual Leave Entitlement (Days)</label>
                  <input type="number" class="fiori-control-input" id="empFormAnnual" value="20" min="0" max="60" />
                </div>

                <div class="form-group">
                  <label class="form-label">Sick Leave Entitlement (Days)</label>
                  <input type="number" class="fiori-control-input" id="empFormSick" value="10" min="0" max="30" />
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="fiori-btn fiori-btn-secondary" onclick="adminView.closeEmpModal()">Cancel</button>
                <button type="submit" class="fiori-btn fiori-btn-primary" id="empFormSubmitBtn">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  renderEmployeesTable(employees) {
    return `
      <div class="fiori-table-wrapper">
        <table class="fiori-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Role & Department</th>
              <th>Email</th>
              <th>Annual / Sick Bal.</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => `
              <tr>
                <td><strong>${emp.id}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="avatar-circle" style="width: 30px; height: 30px; font-size: 0.75rem;">${emp.avatarInitials}</div>
                    <span>${emp.name}</span>
                  </div>
                </td>
                <td>
                  <div>${emp.role}</div>
                  <div style="font-size: 0.75rem; color: var(--sap-text-muted);">${emp.department}</div>
                </td>
                <td>${emp.email}</td>
                <td>
                  <span style="color: var(--sap-brand-blue); font-weight: 700;">${emp.leaveBalance.annual}A</span> / 
                  <span style="color: var(--sap-success-text); font-weight: 700;">${emp.leaveBalance.sick}S</span>
                </td>
                <td>
                  <span class="fiori-status status-present">${emp.status}</span>
                </td>
                <td style="text-align: right;">
                  <button class="fiori-btn fiori-btn-secondary fiori-btn-sm" onclick="adminView.openEditEmployeeModal('${emp.id}')" title="Edit Employee">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="fiori-btn fiori-btn-danger fiori-btn-sm" onclick="adminView.handleDeleteEmployee('${emp.id}')" title="Delete Employee">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  filterEmployees() {
    const q = document.getElementById('adminSearchEmp')?.value || '';
    const dept = document.getElementById('adminDeptFilter')?.value || 'ALL';

    const filtered = odataService.getEmployees(q, dept);
    const container = document.getElementById('adminEmpTableContainer');
    if (container) {
      container.innerHTML = this.renderEmployeesTable(filtered);
    }
  }

  openAddEmployeeModal() {
    document.getElementById('empFormEditId').value = '';
    document.getElementById('empModalTitle').textContent = 'Add New Employee';
    document.getElementById('empFormName').value = '';
    document.getElementById('empFormRole').value = '';
    document.getElementById('empFormEmail').value = '';
    document.getElementById('empFormAnnual').value = '20';
    document.getElementById('empFormSick').value = '10';

    document.getElementById('empModalOverlay').classList.add('active');
  }

  openEditEmployeeModal(empId) {
    const emp = odataService.getEmployeeById(empId);
    if (!emp) return;

    document.getElementById('empFormEditId').value = emp.id;
    document.getElementById('empModalTitle').textContent = `Edit Employee (${emp.id})`;
    document.getElementById('empFormName').value = emp.name;
    document.getElementById('empFormRole').value = emp.role;
    document.getElementById('empFormDept').value = emp.department;
    document.getElementById('empFormEmail').value = emp.email;
    document.getElementById('empFormAnnual').value = emp.leaveBalance.annual;
    document.getElementById('empFormSick').value = emp.leaveBalance.sick;

    document.getElementById('empModalOverlay').classList.add('active');
  }

  closeEmpModal() {
    document.getElementById('empModalOverlay').classList.remove('active');
  }

  handleEmpFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('empFormEditId').value;
    const name = document.getElementById('empFormName').value;
    const role = document.getElementById('empFormRole').value;
    const department = document.getElementById('empFormDept').value;
    const email = document.getElementById('empFormEmail').value;
    const annual = parseInt(document.getElementById('empFormAnnual').value || 20);
    const sick = parseInt(document.getElementById('empFormSick').value || 10);

    if (editId) {
      odataService.updateEmployee(editId, {
        name, role, department, email,
        leaveBalance: { annual, sick, casual: 5, maternityPaternity: 0 }
      });
      appController.showToast(`Updated employee ${name} (${editId})!`);
    } else {
      const newEmp = odataService.addEmployee({ name, role, department, email, annualLeave: annual, sickLeave: sick });
      appController.showToast(`Created new employee ${newEmp.name} (${newEmp.id})!`);
    }

    this.closeEmpModal();
    this.switchSubTab('employees');
  }

  handleDeleteEmployee(empId) {
    const emp = odataService.getEmployeeById(empId);
    if (!emp) return;

    if (confirm(`Are you sure you want to deactivate/delete employee record for ${emp.name} (${empId})?`)) {
      odataService.deleteEmployee(empId);
      appController.showToast(`Deactivated employee ${emp.name}!`);
      this.switchSubTab('employees');
    }
  }

  renderPoliciesSection(leaveTypes, holidays) {
    return `
      <div class="form-grid" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <!-- Left: Leave Types Table -->
        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-sliders-h"></i> SAP Fiori Leave Policy & Rule Engine</span>
          </div>
          <div class="fiori-card-body" style="padding: 0;">
            <div class="fiori-table-wrapper">
              <table class="fiori-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Leave Type Name</th>
                    <th>Default Days</th>
                    <th>Carry Forward</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  ${leaveTypes.map(t => `
                    <tr>
                      <td><strong>${t.code}</strong></td>
                      <td>${t.name}</td>
                      <td><strong>${t.defaultDays} Days</strong></td>
                      <td>
                        <span class="fiori-status ${t.carryForwardAllowed ? 'status-present' : 'status-absent'}">
                          ${t.carryForwardAllowed ? `Yes (${t.maxCarryForward}d)` : 'No'}
                        </span>
                      </td>
                      <td>
                        <span class="fiori-status ${t.requiresApproval ? 'status-pending' : 'status-present'}">
                          ${t.requiresApproval ? 'Required' : 'Auto'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Official Public Holidays Configurator -->
        <div class="fiori-card">
          <div class="fiori-card-header">
            <span class="fiori-card-title"><i class="fas fa-calendar-check"></i> Statutory Public Holidays (2026)</span>
          </div>
          <div class="fiori-card-body" style="padding: 0;">
            <div class="fiori-table-wrapper">
              <table class="fiori-table">
                <thead>
                  <tr>
                    <th>Holiday Date</th>
                    <th>Occasion Name</th>
                  </tr>
                </thead>
                <tbody>
                  ${holidays.map(h => `
                    <tr>
                      <td><strong style="color: var(--sap-brand-blue);">${h.date}</strong></td>
                      <td>${h.name}</td>
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

  renderAuditSection(auditLogs) {
    return `
      <div class="fiori-card">
        <div class="fiori-card-header">
          <span class="fiori-card-title"><i class="fas fa-list-ol"></i> System Event & Audit Logs</span>
          <button class="fiori-btn fiori-btn-secondary fiori-btn-sm" onclick="adminView.exportDataJSON()">
            <i class="fas fa-file-csv"></i> Export Audit Log CSV
          </button>
        </div>
        <div class="fiori-card-body" style="padding: 0;">
          <div class="fiori-table-wrapper">
            <table class="fiori-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action Type</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.map(log => `
                  <tr>
                    <td><strong>${log.id}</strong></td>
                    <td>${log.timestamp}</td>
                    <td><strong>${log.user}</strong></td>
                    <td><span class="fiori-status status-info">${log.action}</span></td>
                    <td>${log.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(odataService.db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sap_fiori_leave_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    appController.showToast('System data successfully exported as JSON file!');
  }
}
