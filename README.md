# 🏢 SAP Fiori Employee Leave & Attendance Management System

An enterprise-grade, web-based Employee Leave & Attendance Management System developed using **SAP Fiori UI design concepts**, **SAPUI5 components**, **Node.js Express REST API**, and a **server-side SQLite database engine**.

![SAP Fiori System](https://img.shields.io/badge/SAP-Fiori%20Horizon-0a6ed1?style=for-the-badge&logo=sap)
![Node.js](https://img.shields.io/badge/Node.js-18.x-107e3e?style=for-the-badge&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-Database-003b57?style=for-the-badge&logo=sqlite)

---

## 🌟 Key Features

### 1. 👨‍💼 Employee Module
- **Dashboard KPI Cards**: Real-time tracking of Annual, Sick, and Casual Leave balances + Monthly Attendance Rate.
- **Smart Leave Application Wizard**: Automatic net working-day calculation (excluding weekends & statutory public holidays), half-day toggle, reason input, and real-time team overlap conflict checking.
- **Printable Leave Authorization Voucher**: Instant generation of official SAP Leave Approval certificates for authorized requests.
- **Leave History & Tracker**: Filterable table with status badges (`Approved`, `Pending`, `Rejected`) and keyword search.
- **Daily Attendance Punch Simulator**: Check-in / Check-out time punch simulator with recorded work hours.

### 2. 👩‍💼 Manager Module
- **Pending Approvals Queue**: Review pending team leave requests with Approve/Reject dialogs and manager feedback notes.
- **Team Schedule Overlap Alert Banner**: Automated detection of overlapping leave dates among team members to prevent capacity shortfalls.
- **Interactive Analytics Dashboard**: Vector SVG donut charts for leave distribution and 6-month team attendance trend lines.
- **Team Quota Progress Monitors & CSV Roster Exporter**: Visual progress bars and downloadable team schedule reports.

### 3. ⚙️ Administrator Module
- **Employee Directory (Full CRUD)**: Create new employee profiles, view details, update leave balances, and deactivate entries.
- **Statutory Public Holidays Configurator**: 2026 Statutory Holidays calendar integrated into the leave calculation engine.
- **System Audit Logs & Backup Exporter**: Real-time event log stream and downloadable JSON/CSV system data backup exporter.

### 4. 🌐 SAP Fiori Launchpad Shell
- **Persona Switcher**: Top header bar allowing instant persona switching between Employee, Manager, and Administrator views.
- **i18n Multi-Language Support**: Switch between **English (EN)**, **Deutsch (DE)**, and **Español (ES)**.
- **Morning Horizon Theme Toggle**: Dark / Light SAP Fiori theme modes.

---

## 🛠️ Technology Stack

- **Frontend**: SAPUI5, XML/JS View Patterns, CSS3 (SAP Fiori Horizon Design System Tokens), FontAwesome 6
- **Backend**: Node.js, Express.js (OData / REST API endpoints)
- **Database**: Server-side SQLite Database (`database/sap_fiori_leave.json` persistent storage)
- **Architecture**: Single-Page Application (SPA) with reactive model binding

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harshitapraharaj-sudo/sap-fiori-leave-management.git
   cd sap-fiori-leave-management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:8085`

---

## 👤 Author
- GitHub: [@harshitapraharaj-sudo](https://github.com/harshitapraharaj-sudo)
