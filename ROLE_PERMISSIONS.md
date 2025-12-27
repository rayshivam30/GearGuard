# 🔐 Role-Based Permissions Guide

## Navigation Bar Access

### ADMIN
- ✅ Dashboard
- ✅ Equipment
- ✅ Teams
- ✅ Requests
- ✅ Calendar
- ✅ Work Centers
- ✅ Users (ADMIN only)

### MANAGER
- ✅ Dashboard
- ✅ Equipment
- ✅ Teams
- ✅ Requests
- ✅ Calendar
- ✅ Work Centers
- ❌ Users

### TECHNICIAN
- ✅ Dashboard
- ✅ Equipment
- ✅ Requests
- ✅ Calendar
- ❌ Teams
- ❌ Work Centers
- ❌ Users

### EMPLOYEE
- ✅ Dashboard
- ✅ Equipment
- ✅ Requests
- ❌ Teams
- ❌ Calendar
- ❌ Work Centers
- ❌ Users

---

## Equipment Permissions

### Create Equipment
- ✅ ADMIN
- ✅ MANAGER
- ❌ TECHNICIAN
- ❌ EMPLOYEE

### Edit Equipment
- ✅ ADMIN
- ✅ MANAGER
- ✅ TECHNICIAN
- ❌ EMPLOYEE

### Delete Equipment
- ✅ ADMIN
- ✅ MANAGER
- ❌ TECHNICIAN
- ❌ EMPLOYEE

### View Equipment
- ✅ All roles

---

## Maintenance Requests Permissions

### Create Request
- ✅ ADMIN
- ✅ MANAGER
- ✅ EMPLOYEE
- ❌ TECHNICIAN (can only work on existing requests)

### Update Request Status
- ✅ ADMIN
- ✅ MANAGER
- ✅ TECHNICIAN
- ❌ EMPLOYEE

### View Requests
- ✅ All roles

---

## Teams Permissions

### Access Teams Page
- ✅ ADMIN
- ✅ MANAGER
- ❌ TECHNICIAN
- ❌ EMPLOYEE

### Create/Edit/Delete Teams
- ✅ ADMIN
- ✅ MANAGER
- ❌ Others

---

## Calendar Permissions

### Access Calendar
- ✅ ADMIN
- ✅ MANAGER
- ✅ TECHNICIAN
- ❌ EMPLOYEE

---

---

## User Management Permissions

### Access Users Page
- ✅ ADMIN only
- ❌ All other roles

### Create/Edit/Delete Users
- ✅ ADMIN only
- ❌ All other roles

---

## Summary

| Feature | ADMIN | MANAGER | TECHNICIAN | EMPLOYEE |
|---------|-------|---------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Equipment (View) | ✅ | ✅ | ✅ | ✅ |
| Equipment (Create) | ✅ | ✅ | ❌ | ❌ |
| Equipment (Edit) | ✅ | ✅ | ✅ | ❌ |
| Equipment (Delete) | ✅ | ✅ | ❌ | ❌ |
| Requests (View) | ✅ | ✅ | ✅ | ✅ |
| Requests (Create) | ✅ | ✅ | ❌ | ✅ |
| Requests (Update) | ✅ | ✅ | ✅ | ❌ |
| Teams | ✅ | ✅ | ❌ | ❌ |
| Calendar | ✅ | ✅ | ✅ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |

---

## Implementation Notes

- All permissions are enforced both in UI (buttons hidden) and in API routes
- Pages redirect unauthorized users to dashboard
- Navigation items are filtered based on role
- Role is loaded from auth context on login

