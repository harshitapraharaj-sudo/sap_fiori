/**
 * SAP Fiori Application Main Controller & Router
 */

class AppController {
  constructor() {
    this.shellView = null;
    this.employeeView = null;
    this.managerView = null;
    this.adminView = null;
    this.currentRole = 'EMP001'; // Default: Employee
    this.currentSubTab = 'dashboard';
    this.currentLang = 'EN';
    this.isDarkMode = false;
  }

  init() {
    this.shellView = new ShellView('shellContainer');
    this.employeeView = new EmployeeView('mainContentContainer');
    this.managerView = new ManagerView('mainContentContainer');
    this.adminView = new AdminView('mainContentContainer');

    this.currentRole = odataService.getCurrentPersonaId();

    this.shellView.render();
    this.updateNavTabs();
    this.renderActiveView();

    odataService.subscribe(() => {
      this.renderActiveView();
    });

    console.log('SAP Fiori Leave & Attendance Management System initialized.');
  }

  switchRole(roleId) {
    this.currentRole = roleId;
    odataService.setPersona(roleId);
    this.shellView.render();
    this.currentSubTab = roleId === 'EMP001' ? 'dashboard' : roleId === 'EMP002' ? 'approvals' : 'employees';
    this.updateNavTabs();
    this.renderActiveView();
    this.showToast(`Switched active role to ${roleId === 'EMP001' ? 'Employee (Alex Morgan)' : roleId === 'EMP002' ? 'Manager (Sarah Jenkins)' : 'Administrator (David Miller)'}`);
  }

  switchLanguage(langCode) {
    this.currentLang = langCode;
    const names = { EN: 'English', DE: 'Deutsch', ES: 'Español' };
    this.showToast(`UI Locale switched to ${names[langCode] || langCode}`);
  }

  updateNavTabs() {
    const tabsContainer = document.getElementById('fioriNavTabs');
    if (!tabsContainer) return;

    if (this.currentRole === 'EMP001') {
      tabsContainer.innerHTML = `
        <span class="fiori-nav-tab ${this.currentSubTab === 'dashboard' ? 'active' : ''}" onclick="appController.navigateTo('dashboard')">
          <i class="fas fa-th-large"></i> Dashboard
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'apply' ? 'active' : ''}" onclick="appController.navigateTo('apply')">
          <i class="fas fa-paper-plane"></i> Apply for Leave
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'history' ? 'active' : ''}" onclick="appController.navigateTo('history')">
          <i class="fas fa-history"></i> Leave History
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'attendance' ? 'active' : ''}" onclick="appController.navigateTo('attendance')">
          <i class="fas fa-user-clock"></i> My Attendance
        </span>
      `;
    } else if (this.currentRole === 'EMP002') {
      tabsContainer.innerHTML = `
        <span class="fiori-nav-tab ${this.currentSubTab === 'approvals' ? 'active' : ''}" onclick="appController.navigateTo('approvals')">
          <i class="fas fa-tasks"></i> Pending Approvals
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'team' ? 'active' : ''}" onclick="appController.navigateTo('team')">
          <i class="fas fa-chart-bar"></i> Team Quotas
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'roster' ? 'active' : ''}" onclick="appController.navigateTo('roster')">
          <i class="fas fa-calendar-alt"></i> Team Roster
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'analytics' ? 'active' : ''}" onclick="appController.navigateTo('analytics')">
          <i class="fas fa-chart-pie"></i> Analytics
        </span>
      `;
    } else {
      tabsContainer.innerHTML = `
        <span class="fiori-nav-tab ${this.currentSubTab === 'employees' ? 'active' : ''}" onclick="appController.navigateTo('employees')">
          <i class="fas fa-users-cog"></i> Employee Directory
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'policies' ? 'active' : ''}" onclick="appController.navigateTo('policies')">
          <i class="fas fa-sliders-h"></i> Leave Policies
        </span>
        <span class="fiori-nav-tab ${this.currentSubTab === 'audit' ? 'active' : ''}" onclick="appController.navigateTo('audit')">
          <i class="fas fa-shield-alt"></i> System Audit Logs
        </span>
      `;
    }
  }

  navigateTo(subTab) {
    this.currentSubTab = subTab;
    this.updateNavTabs();

    if (this.currentRole === 'EMP001') {
      this.employeeView.switchSubTab(subTab);
    } else if (this.currentRole === 'EMP002') {
      this.managerView.switchSubTab(subTab);
    } else {
      this.adminView.switchSubTab(subTab);
    }
  }

  renderActiveView() {
    if (this.currentRole === 'EMP001') {
      this.employeeView.render(this.currentSubTab);
    } else if (this.currentRole === 'EMP002') {
      this.managerView.render(this.currentSubTab);
    } else {
      this.adminView.render(this.currentSubTab);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-${this.isDarkMode ? 'sun' : 'moon'}"></i>`;
    }
    this.showToast(`Switched to ${this.isDarkMode ? 'Dark' : 'Morning Light'} Fiori Theme`);
  }

  showToast(message) {
    let container = document.getElementById('fioriToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fioriToastContainer';
      container.className = 'fiori-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'fiori-toast';
    toast.innerHTML = `<i class="fas fa-info-circle" style="color: #38bdf8;"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  showNotifications() {
    this.showToast('Notifications: 2 Pending Leave Approvals & 1 Attendance Alert.');
  }
}

const appController = new AppController();
window.addEventListener('DOMContentLoaded', () => appController.init());
