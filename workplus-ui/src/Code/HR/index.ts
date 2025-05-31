// HR Module Exports

// Main Landing
export { default as HRLanding } from './pages/HRLanding';
export { default as HRMastersLanding } from './pages/HRMastersLanding';

// Attendance Module
export { default as AttendancePage } from './Attendance/pages/AttendancePage';

// Leave Management Module  
export { default as LeavePage } from './LMS/pages/LeavePage';

// Components
export { default as AttendanceForm } from './Attendance/components/AttendanceForm';
export { default as BulkAttendanceForm } from './Attendance/components/BulkAttendanceForm';
export { default as LeaveRequestForm } from './LMS/components/LeaveRequestForm';

// Services
export { useHRService } from './services/hrService';

// Types
export type {
  AttendanceRecord,
  CreateAttendance,
  BulkAttendance,
  AttendanceReport,
  LeaveType,
  LeaveRequest,
  CreateLeaveRequest,
  ApproveLeaveRequest,
  LeaveBalance,
  AllocateLeaveBalance,
  Worker
} from './services/hrService'; 