# GearGuard: Complete Workflow Documentation

## 🚀 System Overview

GearGuard is a maintenance management system that connects **Equipment**, **Teams**, and **Maintenance Requests** to track and manage all company assets and their maintenance needs.

---

## 📋 Table of Contents

1. [Initial Setup & Authentication](#1-initial-setup--authentication)
2. [Equipment Management Workflow](#2-equipment-management-workflow)
3. [Team Management Workflow](#3-team-management-workflow)
4. [Maintenance Request Workflows](#4-maintenance-request-workflows)
5. [Calendar View Workflow](#5-calendar-view-workflow)
6. [Kanban Board Workflow](#6-kanban-board-workflow)
7. [Scrap & Completion Logic](#7-scrap--completion-logic)

---

## 1. Initial Setup & Authentication

### User Registration Flow
```
1. User visits /sign-up
2. Fills in:
   - Email
   - Password (min 8 characters)
   - Name
   - Company Name
   - Company Location (optional)
3. System creates:
   - New Company record
   - New User with ADMIN role
   - Session cookie (30 days)
4. User redirected to /dashboard
```

### User Login Flow
```
1. User visits /sign-in
2. Enters email and password
3. System validates credentials
4. Creates session cookie
5. User redirected to /dashboard
```

### Navigation Structure
- **Dashboard** (`/dashboard`) - Overview of stats and critical equipment
- **Equipment** (`/equipment`) - Manage all company assets
- **Teams** (`/teams`) - Manage maintenance teams
- **Requests** (`/requests`) - Kanban board for maintenance requests
- **Calendar** (`/calendar`) - Preventive maintenance scheduling

---

## 2. Equipment Management Workflow

### Creating Equipment
```
1. Navigate to /equipment
2. Click "New Equipment" button
3. Fill in form:
   - Equipment Name (required)
   - Serial Number (required, unique)
   - Category (Monitors, Computers, Printers, Scanners, Other)
   - Department (optional)
   - Assigned To (Employee name/email - optional)
   - Location (Physical location - optional)
   - Purchase Date (optional)
   - Warranty Information (optional)
   - Default Assigned Technician (dropdown - optional)
   - Default Maintenance Team (dropdown - optional)
4. Click "Save"
5. Equipment appears in table with:
   - Health bar (default 100%)
   - Status (OPERATIONAL by default)
   - Smart "Maintenance" button with badge showing open requests count
```

### Equipment Tracking
- **By Department**: Filter/view equipment by department
- **By Employee**: See equipment assigned to specific employees
- **By Status**: OPERATIONAL, MAINTENANCE_REQUIRED, OUT_OF_SERVICE, CRITICAL

### Smart Button Feature
- Each equipment row has a "Maintenance" button
- Badge shows count of open requests (NEW, IN_PROGRESS)
- Clicking button navigates to requests page filtered by equipment

---

## 3. Team Management Workflow

### Creating a Team
```
1. Navigate to /teams
2. Click "New Team" button
3. Enter:
   - Team Name (e.g., "Mechanics", "Electricians", "IT Support")
   - Description (optional)
4. Click "Save"
```

### Adding Team Members
```
1. Select a team
2. Add members (Users with TECHNICIAN or MANAGER role)
3. Each member can be assigned to multiple teams
4. Team members can only pick up requests assigned to their team
```

---

## 4. Maintenance Request Workflows

### Flow 1: The Breakdown (Corrective Maintenance)

#### Step 1: Create Request
```
1. Navigate to /requests
2. Click "New Request" button
3. Fill in:
   - Subject (e.g., "Leaking Oil")
   - Equipment (dropdown - REQUIRED)
   - Maintenance Type: CORRECTIVE
   - Priority: LOW, MEDIUM, HIGH, or CRITICAL
   - Description (optional)
   - Instructions (optional)
```

#### Step 2: Auto-Fill Logic (Automatic)
```
When equipment is selected:
1. System fetches equipment details
2. Auto-fills:
   - Equipment Category (from equipment record)
   - Assigned Team (from equipment's defaultMaintenanceTeamId)
   - Assigned Technician (from equipment's assignedTechnicianId)
3. User can override these if needed
```

#### Step 3: Request State
```
- Request starts in "NEW" status
- Appears in "New Requests" column on Kanban board
```

#### Step 4: Assignment
```
1. Manager or Technician views Kanban board
2. Can assign themselves via request form:
   - Select "Assign Technician" dropdown
   - Choose technician from list
3. Or technician can pick up request manually
```

#### Step 5: Execution
```
1. Technician clicks "Move Forward" button
2. Status changes: NEW → IN_PROGRESS
3. Request moves to "In Progress" column
4. Technician can:
   - Add notes
   - Update instructions
   - Track duration (hours spent)
```

#### Step 6: Completion
```
1. Technician clicks "Move Forward" again
2. Status changes: IN_PROGRESS → REPAIRED
3. System automatically:
   - Updates equipment status to OPERATIONAL
   - Increases equipment health by 20%
   - Sets lastMaintenance date to current date
4. Request moves to "Repaired" column
```

### Flow 2: The Routine Checkup (Preventive Maintenance)

#### Step 1: Scheduling
```
1. Navigate to /requests or /calendar
2. Click "New Request"
3. Fill in:
   - Subject
   - Equipment
   - Maintenance Type: PREVENTIVE
   - Scheduled Date (REQUIRED for preventive)
   - Priority
   - Description
```

#### Step 2: Calendar View
```
1. Navigate to /calendar
2. Calendar shows:
   - Dates with scheduled maintenance (highlighted)
   - Click any date to see scheduled requests
   - Click date to schedule new maintenance
3. View shows:
   - All preventive requests for selected date
   - Equipment name
   - Priority
   - Assigned team
```

#### Step 3: Execution
```
1. On scheduled date, request appears in calendar
2. Technician views Kanban board or calendar
3. Picks up request
4. Moves through workflow: NEW → IN_PROGRESS → REPAIRED
```

---

## 5. Calendar View Workflow

### Viewing Preventive Maintenance
```
1. Navigate to /calendar
2. Calendar displays:
   - Current month view
   - Dates with scheduled maintenance (blue highlight)
3. Click any date:
   - Shows list of preventive requests for that date
   - Displays equipment, priority, team
4. Click "Schedule Maintenance" to create new request
```

### Scheduling New Maintenance
```
1. Click on a date in calendar
2. Click "Schedule Maintenance" button
3. Form opens with:
   - Selected date pre-filled
   - Maintenance Type: PREVENTIVE (default)
4. Fill in other details and save
```

---

## 6. Kanban Board Workflow

### Board Structure
```
Columns (left to right):
1. NEW - Newly created requests
2. IN_PROGRESS - Active work
3. REPAIRED - Completed successfully
4. SCRAP - Equipment beyond repair
5. CANCELLED - Cancelled requests
```

### Request Card Features
```
Each card shows:
- Subject
- Priority badge (LOW, MEDIUM, HIGH, CRITICAL)
- Equipment name
- Maintenance type icon
- Requested by (user name)
- Assigned technician (avatar + name)
- Overdue indicator (red border + warning if scheduled date passed)
```

### Moving Requests
```
1. Click "Move Forward" button on card
   - NEW → IN_PROGRESS
   - IN_PROGRESS → REPAIRED
2. Click "Mark as Scrap" button (for IN_PROGRESS only)
   - IN_PROGRESS → SCRAP
   - Equipment automatically marked as OUT_OF_SERVICE
```

### Overdue Indicators
```
Visual indicators for overdue requests:
- Red left border on card
- "⚠️ OVERDUE" text
- Applies when:
  - scheduledDate < today
  - Status is not REPAIRED, SCRAP, or CANCELLED
```

---

## 7. Scrap & Completion Logic

### Scrap Workflow
```
1. Request is IN_PROGRESS
2. Technician determines equipment cannot be repaired
3. Clicks "Mark as Scrap" button
4. System automatically:
   - Changes request status to SCRAP
   - Changes equipment status to OUT_OF_SERVICE
   - Equipment health remains unchanged
5. Request moves to "Scrap" column
```

### Repair Completion Logic
```
When request moves to REPAIRED:
1. Equipment status → OPERATIONAL
2. Equipment health → increases by 20% (max 100%)
3. lastMaintenance → set to current date
4. Request moves to "Repaired" column
```

### Duration Tracking
```
1. When editing IN_PROGRESS or REPAIRED request
2. Technician can enter "Duration (Hours Spent)"
3. System stores in minutes (hours × 60)
4. Used for reporting and analytics
```

---

## 🔄 Complete User Journey Example

### Scenario: Printer Breakdown

```
1. Employee notices printer "Printer 01" is leaking ink
2. Employee (or any user) navigates to /requests
3. Clicks "New Request"
4. Fills in:
   - Subject: "Leaking Ink"
   - Equipment: Selects "Printer 01"
   - System auto-fills:
     * Category: Printers
     * Assigned Team: IT Support (from equipment's default team)
     * Assigned Technician: John Doe (from equipment's default technician)
   - Priority: HIGH
   - Description: "Ink leaking from bottom"
5. Clicks "Save"
6. Request appears in "NEW" column on Kanban board

7. IT Support team member (Sarah) views Kanban board
8. Sees request in "NEW" column
9. Clicks on request card to view details
10. Clicks "Move Forward" → Status: IN_PROGRESS
11. Request moves to "In Progress" column

12. Sarah works on printer
13. Updates request with:
    - Notes: "Replaced ink cartridge seal"
    - Duration: 2 hours
14. Clicks "Move Forward" → Status: REPAIRED
15. System automatically:
    - Sets printer status to OPERATIONAL
    - Increases printer health by 20%
    - Updates lastMaintenance date
16. Request moves to "Repaired" column
```

### Scenario: Preventive Maintenance

```
1. Manager navigates to /calendar
2. Clicks on next Monday's date
3. Clicks "Schedule Maintenance"
4. Fills in:
   - Subject: "Monthly Printer Checkup"
   - Equipment: "Printer 01"
   - Maintenance Type: PREVENTIVE
   - Scheduled Date: Next Monday (pre-filled)
   - Priority: MEDIUM
5. Clicks "Save"

6. On next Monday:
   - Request appears in calendar view
   - Request appears in "NEW" column on Kanban board
7. Technician views calendar or Kanban board
8. Picks up request
9. Performs routine checkup
10. Moves through workflow: NEW → IN_PROGRESS → REPAIRED
```

---

## 📊 Key Features Summary

### Equipment Features
- ✅ Complete equipment database with all details
- ✅ Tracking by Department and Employee
- ✅ Default Maintenance Team assignment
- ✅ Default Technician assignment
- ✅ Smart button showing open requests count
- ✅ Health tracking and status management

### Request Features
- ✅ Auto-fill logic (equipment → team/technician)
- ✅ Corrective and Preventive maintenance types
- ✅ Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Scheduled date for preventive maintenance
- ✅ Duration tracking (hours spent)
- ✅ Overdue indicators
- ✅ Technician avatars

### Workflow Features
- ✅ Kanban board with drag-ready structure
- ✅ Status progression: NEW → IN_PROGRESS → REPAIRED
- ✅ Scrap functionality with automatic equipment marking
- ✅ Calendar view for preventive maintenance
- ✅ Automatic equipment status updates

### Smart Automation
- ✅ Auto-fill team and technician from equipment
- ✅ Auto-update equipment status on repair/scrap
- ✅ Auto-increase equipment health on repair
- ✅ Overdue detection and visual indicators

---

## 🎯 User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Can create requests, assign teams, view all data
- **TECHNICIAN**: Can pick up requests, update status, complete work
- **EMPLOYEE**: Can create requests, view assigned equipment

---

## 🔐 Security & Access

- All routes protected (except sign-in/sign-up)
- Session-based authentication (30-day cookies)
- User ID stored in httpOnly cookies
- API endpoints validate user authentication
- Multi-tenant support (company-based isolation)

---

This workflow documentation covers the complete end-to-end process of using GearGuard for maintenance management! 🚀

