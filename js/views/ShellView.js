/**
 * SAP Fiori Shell Launchpad Header & Navigation Bar View
 */

class ShellView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    const currentEmp = odataService.getCurrentEmployee();
    const activePersonaId = odataService.getCurrentPersonaId();
    const currentLang = appController.currentLang || 'EN';

    this.container.innerHTML = `
      <header class="fiori-shellbar">
        <div class="fiori-shellbar-left">
          <div class="fiori-logo-container" id="shellLogo">
            <span class="sap-logo-badge">SAP</span>
            <span>Fiori</span>
          </div>
          <span class="fiori-app-title">Employee Leave & Attendance Management</span>
        </div>

        <div class="fiori-shellbar-center">
          <i class="fas fa-search fiori-search-icon"></i>
          <input 
            type="text" 
            class="fiori-search-input" 
            id="globalSearchInput" 
            placeholder="Search employees, leave requests, policies..." 
          />
        </div>

        <div class="fiori-shellbar-right">
          <!-- i18n Language Switcher -->
          <select class="fiori-control-select" style="padding: 4px 8px; font-size: 0.75rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;" onchange="appController.switchLanguage(this.value)">
            <option value="EN" ${currentLang === 'EN' ? 'selected' : ''} style="color:#000;">🌐 EN (English)</option>
            <option value="DE" ${currentLang === 'DE' ? 'selected' : ''} style="color:#000;">🌐 DE (Deutsch)</option>
            <option value="ES" ${currentLang === 'ES' ? 'selected' : ''} style="color:#000;">🌐 ES (Español)</option>
          </select>

          <!-- Persona Role Switcher -->
          <div class="persona-switcher" title="Switch User Role Persona">
            <button 
              class="persona-btn ${activePersonaId === 'EMP001' ? 'active' : ''}" 
              onclick="appController.switchRole('EMP001')"
            >
              <i class="fas fa-user-check"></i> Employee
            </button>
            <button 
              class="persona-btn ${activePersonaId === 'EMP002' ? 'active' : ''}" 
              onclick="appController.switchRole('EMP002')"
            >
              <i class="fas fa-user-tie"></i> Manager
            </button>
            <button 
              class="persona-btn ${activePersonaId === 'EMP005' ? 'active' : ''}" 
              onclick="appController.switchRole('EMP005')"
            >
              <i class="fas fa-user-shield"></i> Admin
            </button>
          </div>

          <!-- Theme Toggle -->
          <button class="shell-icon-btn" id="themeToggleBtn" onclick="appController.toggleTheme()" title="Toggle Dark/Light Horizon Theme">
            <i class="fas fa-moon"></i>
          </button>

          <!-- Notification Bell -->
          <button class="shell-icon-btn" id="notifBtn" title="Notifications" onclick="appController.showNotifications()">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </button>

          <!-- User Profile Avatar Pill -->
          <div class="user-avatar-btn" id="userProfileBtn" title="${currentEmp.name} (${currentEmp.role})">
            <div class="avatar-circle">${currentEmp.avatarInitials}</div>
            <span style="display: inline-block; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${currentEmp.name.split(' ')[0]}
            </span>
          </div>
        </div>
      </header>

      <!-- Sub-Header Title & Dynamic Tab Navigation -->
      <div class="fiori-header-bar">
        <div class="fiori-page-header">
          <div class="fiori-title-group">
            <h1 id="activeRoleTitle">
              <i class="fas ${activePersonaId === 'EMP001' ? 'fa-user' : activePersonaId === 'EMP002' ? 'fa-users-cog' : 'fa-sliders-h'}"></i>
              ${activePersonaId === 'EMP001' ? 'My Leave & Attendance Portal' : activePersonaId === 'EMP002' ? 'Manager Approval Workspace' : 'System Administration & Employee Directory'}
            </h1>
            <p id="activeRoleSub">
              Logged in as <strong>${currentEmp.name}</strong> (${currentEmp.role} — ${currentEmp.department})
            </p>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--sap-text-secondary); background: var(--sap-bg-main); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--sap-card-border);">
              <i class="fas fa-clock"></i> <span id="fioriClock">--:--:--</span>
            </span>
          </div>
        </div>

        <nav class="fiori-nav-tabs" id="fioriNavTabs">
          <!-- Dynamic Tabs Injected by App Controller -->
        </nav>
      </div>
    `;

    this.startClock();
  }

  startClock() {
    const updateTime = () => {
      const el = document.getElementById('fioriClock');
      if (el) {
        el.textContent = new Date().toLocaleTimeString();
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
}
