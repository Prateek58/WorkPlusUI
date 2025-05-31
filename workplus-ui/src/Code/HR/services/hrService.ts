import axios from 'axios';
import { API_URL } from '../../Common/config';
import { useApi } from '../../Common/hooks/useApi';
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

// Attendance Types
export interface AttendanceRecord {
  id: number;
  workerId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: string;
  halfDayType?: string;
  remarks?: string;
  // Enhanced fields for comp-off and overtime
  isOvertime?: boolean;
  isHolidayWork?: boolean;
  isPaid?: boolean;
  overtimeHours?: number;
  compOffEarned?: number; // Days earned as comp-off
  payMultiplier?: number; // 1.0 = normal, 1.5 = overtime, 2.0 = holiday
  attendanceType?: 'Regular' | 'Overtime' | 'Holiday_Work' | 'Comp_Off_Used';
  createdAt: string;
  updatedAt: string;
  // Navigation properties
  workerName?: string;
}

export interface CreateAttendance {
  workerId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  halfDayType?: string;
  remarks?: string;
  // Enhanced fields
  isOvertime?: boolean;
  isHolidayWork?: boolean;
  isPaid?: boolean;
  overtimeHours?: number;
  compOffEarned?: number;
  payMultiplier?: number;
  attendanceType?: 'Regular' | 'Overtime' | 'Holiday_Work' | 'Comp_Off_Used';
}

export interface BulkAttendance {
  attendanceDate: string;
  workerIds: number[];
  status: string;
  halfDayType?: string;
  remarks?: string;
}

export interface BulkAttendanceResult {
  processedAttendance: AttendanceRecord[];
  skippedWorkers: string[];
  message: string;
  hasWarnings: boolean;
}

export interface AttendanceReport {
  workerId: number;
  workerName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  attendancePercentage: number;
}

// Leave Types
export interface LeaveType {
  id: number;
  code: string;
  name: string;
  isPaid: boolean;
  appliesTo: 'FullTime' | 'PartTime' | 'Contract' | 'All';
  maxDaysPerYear: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: number;
  workerId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedDate: string;
  approvedBy?: number;
  approvedDate?: string;
  rejectionReason?: string;
  // Navigation properties
  workerName?: string;
  leaveTypeName?: string;
  approverName?: string;
}

export interface CreateLeaveRequest {
  workerId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface ApproveLeaveRequest {
  status: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  id: number;
  workerId: number;
  leaveTypeId: number;
  year: number;
  allocated: number;
  used: number;
  balance: number; // This is the remaining balance
  // Navigation properties
  workerName?: string;
  leaveTypeName?: string;
  leaveTypeCode?: string;
}

export interface AllocateLeaveBalance {
  workerId: number;
  leaveTypeId: number;
  year: number;
  allocated: number;
}

// Worker interface (for dropdowns) - using actual WorkPlus Worker structure
export interface Worker {
  workerId: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfJoining?: string | null;
  dateOfLeaving?: string | null;
  typeId?: number;
  isActive?: boolean;
}

// HR Service - Manages HR master data operations
export interface Holiday {
  id: number;
  holidayDate: string;
  name: string;
  isOptional: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarConfig {
  id: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorkingDay: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HRConfig {
  configKey: string;
  configValue: string;
  description?: string;
  updatedAt?: string;
}

// Mock data for development - will be replaced with API calls
const mockLeaveTypes: LeaveType[] = [
  {
    id: 1,
    code: 'CL',
    name: 'Casual Leave',
    isPaid: true,
    appliesTo: 'All',
    maxDaysPerYear: 12,
    isActive: true,
  },
  {
    id: 2,
    code: 'SL',
    name: 'Sick Leave',
    isPaid: true,
    appliesTo: 'All',
    maxDaysPerYear: 12,
    isActive: true,
  },
  {
    id: 3,
    code: 'EL',
    name: 'Earned Leave',
    isPaid: true,
    appliesTo: 'FullTime',
    maxDaysPerYear: 21,
    isActive: true,
  },
  {
    id: 4,
    code: 'ML',
    name: 'Maternity Leave',
    isPaid: true,
    appliesTo: 'All',
    maxDaysPerYear: 180,
    isActive: true,
  },
];

const mockHolidays: Holiday[] = [
  {
    id: 1,
    holidayDate: '2024-01-26',
    name: 'Republic Day',
    isOptional: false,
    isActive: true,
  },
  {
    id: 2,
    holidayDate: '2024-08-15',
    name: 'Independence Day',
    isOptional: false,
    isActive: true,
  },
  {
    id: 3,
    holidayDate: '2024-10-31',
    name: 'Diwali',
    isOptional: false,
    isActive: true,
  },
];

const mockCalendarConfig: CalendarConfig[] = [
  { id: 1, dayOfWeek: 'Monday', isWorkingDay: true },
  { id: 2, dayOfWeek: 'Tuesday', isWorkingDay: true },
  { id: 3, dayOfWeek: 'Wednesday', isWorkingDay: true },
  { id: 4, dayOfWeek: 'Thursday', isWorkingDay: true },
  { id: 5, dayOfWeek: 'Friday', isWorkingDay: true },
  { id: 6, dayOfWeek: 'Saturday', isWorkingDay: true },
  { id: 7, dayOfWeek: 'Sunday', isWorkingDay: false },
];

const mockHRConfigs: HRConfig[] = [
  {
    configKey: 'attendance_required_for_job_entry',
    configValue: 'true',
    description: 'Require attendance marking before job entry',
  },
  {
    configKey: 'leave_auto_marks_attendance',
    configValue: 'true',
    description: 'Automatically mark attendance when leave is approved',
  },
  {
    configKey: 'leave_requires_approval',
    configValue: 'true',
    description: 'Leave requests require approval',
  },
  {
    configKey: 'restrict_attendance_non_working_days',
    configValue: 'true',
    description: 'Restrict attendance marking on non-working days (weekends and holidays)',
  },
  {
    configKey: 'allow_past_date_attendance',
    configValue: 'true',
    description: 'Allow marking attendance for past dates',
  },
  {
    configKey: 'allow_future_date_attendance',
    configValue: 'false',
    description: 'Allow marking attendance for future dates',
  },
  {
    configKey: 'attendance_late_cutoff_time',
    configValue: '10:00',
    description: 'Time after which attendance is considered late',
  },
  // Comp-off and Overtime Configuration
  {
    configKey: 'weekend_work_pay_multiplier',
    configValue: '1.5',
    description: 'Pay multiplier for weekend work (1.5 = 150% of normal rate)',
  },
  {
    configKey: 'holiday_work_pay_multiplier',
    configValue: '2.0',
    description: 'Pay multiplier for holiday work (2.0 = 200% of normal rate)',
  },
  {
    configKey: 'overtime_pay_multiplier',
    configValue: '1.5',
    description: 'Pay multiplier for overtime work (1.5 = 150% of normal rate)',
  },
  {
    configKey: 'comp_off_earning_ratio',
    configValue: '1.0',
    description: 'Comp-off days earned per day of non-working day work (1.0 = 1 comp-off day)',
  },
  {
    configKey: 'weekend_work_generates_comp_off',
    configValue: 'true',
    description: 'Working on weekends automatically generates comp-off days',
  },
  {
    configKey: 'holiday_work_generates_comp_off',
    configValue: 'true',
    description: 'Working on holidays automatically generates comp-off days',
  },
  {
    configKey: 'comp_off_vs_overtime_pay_choice',
    configValue: 'choice',
    description: 'How to handle non-working day compensation: "comp_off", "overtime_pay", or "choice"',
  },
  {
    configKey: 'overtime_threshold_hours',
    configValue: '8',
    description: 'Hours after which overtime pay kicks in on regular working days',
  },
];

// Custom hook for HR service operations
export const useHRService = () => {
  const { callApi } = useApi();

  // Attendance Services
  const getAttendance = async (date?: string, workerId?: number): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (workerId) params.append('workerId', workerId.toString());
    
    return callApi(
      () => axios.get(`${API_URL}/hr/attendance?${params.toString()}`).then(res => res.data),
      { loadingMessage: 'Loading attendance records...' }
    );
  };

  const markAttendance = async (attendance: CreateAttendance): Promise<AttendanceRecord> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/attendance`, attendance).then(res => res.data),
      { loadingMessage: 'Marking attendance...' }
    );
  };

  const markBulkAttendance = async (bulkAttendance: BulkAttendance): Promise<BulkAttendanceResult> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/attendance/bulk`, bulkAttendance).then(res => {
        // Handle the new response format
        if (res.data.success && res.data.data) {
          return {
            processedAttendance: res.data.data.processedAttendance || [],
            skippedWorkers: res.data.data.skippedWorkers || [],
            message: res.data.data.message || 'Bulk attendance processed successfully',
            hasWarnings: res.data.data.hasWarnings || false
          };
        }
        throw new Error('Invalid response format');
      }),
      { loadingMessage: 'Marking bulk attendance...' }
    );
  };

  const updateAttendance = async (id: number, attendance: CreateAttendance): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/hr/attendance/${id}`, attendance),
      { loadingMessage: 'Updating attendance...' }
    );
  };

  const deleteAttendance = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/hr/attendance/${id}`),
      { loadingMessage: 'Deleting attendance...' }
    );
  };

  const getAttendanceReport = async (startDate: string, endDate: string, workerId?: number): Promise<AttendanceReport[]> => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (workerId) params.append('workerId', workerId.toString());
    
    return callApi(
      () => axios.get(`${API_URL}/hr/attendance/report?${params.toString()}`).then(res => res.data),
      { loadingMessage: 'Generating attendance report...' }
    );
  };

  const checkLeaveConflict = async (workerId: number, date: string): Promise<{
    hasConflict: boolean;
    leaveStatus?: string;
    leaveType?: string;
    message?: string;
  }> => {
    const params = new URLSearchParams();
    params.append('workerId', workerId.toString());
    params.append('date', date);
    
    return callApi(
      () => axios.get(`${API_URL}/hr/attendance/check-leave-conflict?${params.toString()}`).then(res => res.data),
      { loadingMessage: 'Checking leave conflicts...' }
    );
  };

  // Leave Services
  const getLeaveTypes = useCallback(async (): Promise<LeaveType[]> => {
    return callApi(
      () => axios.get(`${API_URL}/hr/leave-types`).then(res => res.data),
      { loadingMessage: 'Loading leave types...' }
    );
  }, [callApi]);

  const createLeaveType = useCallback(async (leaveType: Omit<LeaveType, 'id'>): Promise<LeaveType> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/leave-types`, leaveType).then(res => res.data),
      { loadingMessage: 'Creating leave type...' }
    );
  }, [callApi]);

  const updateLeaveType = useCallback(async (id: number, leaveType: Partial<LeaveType>): Promise<LeaveType> => {
    return callApi(
      () => axios.put(`${API_URL}/hr/leave-types/${id}`, leaveType).then(res => res.data),
      { loadingMessage: 'Updating leave type...' }
    );
  }, [callApi]);

  const deleteLeaveType = useCallback(async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/hr/leave-types/${id}`),
      { loadingMessage: 'Deleting leave type...' }
    );
  }, [callApi]);

  const getLeaveRequests = async (workerId?: number, status?: string): Promise<LeaveRequest[]> => {
    const params = new URLSearchParams();
    if (workerId) params.append('workerId', workerId.toString());
    if (status) params.append('status', status);
    
    return callApi(
      () => axios.get(`${API_URL}/hr/leave/requests?${params.toString()}`).then(res => res.data),
      { loadingMessage: 'Loading leave requests...' }
    );
  };

  const createLeaveRequest = async (request: CreateLeaveRequest): Promise<LeaveRequest> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/leave/requests`, request).then(res => res.data),
      { loadingMessage: 'Creating leave request...' }
    );
  };

  const approveLeaveRequest = async (id: number, approval: ApproveLeaveRequest): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/hr/leave/requests/${id}/approve`, approval),
      { loadingMessage: 'Processing leave request...' }
    );
  };

  const getLeaveBalance = async (workerId: number): Promise<LeaveBalance[]> => {
    return callApi(
      () => axios.get(`${API_URL}/hr/leave/balance/${workerId}`).then(res => res.data),
      { loadingMessage: 'Loading leave balance...' }
    );
  };

  const allocateLeaveBalance = async (allocation: AllocateLeaveBalance): Promise<void> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/leave/balance/allocate`, allocation),
      { loadingMessage: 'Allocating leave balance...' }
    );
  };

  const autoAllocateLeaveBalance = async (workerId: number, year: number): Promise<void> => {
    return callApi(
      () => axios.post(`${API_URL}/hr/leave/balance/auto-allocate/${workerId}/${year}`),
      { loadingMessage: 'Auto-allocating leave balances...' }
    );
  };

  // Master Data
  const getWorkers = async (): Promise<Worker[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/workers`).then(res => res.data),
      { loadingMessage: 'Loading workers...' }
    );
  };

  // Holidays
  const getHolidays = useCallback(async (): Promise<Holiday[]> => {
    try {
      return await callApi(
        () => axios.get(`${API_URL}/hr/holidays`).then(res => res.data),
        { loadingMessage: 'Loading holidays...' }
      );
    } catch (error) {
      // Fallback to mock data if API not available
      console.warn('Holiday API not available, using mock data:', error);
      return mockHolidays;
    }
  }, [callApi]);

  const createHoliday = useCallback(async (holiday: Omit<Holiday, 'id'>): Promise<Holiday> => {
    try {
      return await callApi(
        () => axios.post(`${API_URL}/hr/holidays`, holiday).then(res => res.data),
        { loadingMessage: 'Creating holiday...' }
      );
    } catch (error) {
      // Fallback to mock behavior if API not available
      console.warn('Holiday API not available, using mock behavior:', error);
      const newHoliday = { ...holiday, id: Date.now() };
      // Add to mock data for this session
      mockHolidays.push(newHoliday);
      return newHoliday;
    }
  }, [callApi]);

  const updateHoliday = useCallback(async (id: number, holiday: Partial<Holiday>): Promise<Holiday> => {
    try {
      return await callApi(
        () => axios.put(`${API_URL}/hr/holidays/${id}`, holiday).then(res => res.data),
        { loadingMessage: 'Updating holiday...' }
      );
    } catch (error) {
      // Fallback to mock behavior if API not available
      console.warn('Holiday API not available, using mock behavior:', error);
      const updatedHoliday = { ...holiday, id } as Holiday;
      // Update mock data for this session
      const index = mockHolidays.findIndex(h => h.id === id);
      if (index !== -1) {
        mockHolidays[index] = { ...mockHolidays[index], ...holiday };
        return mockHolidays[index];
      }
      return updatedHoliday;
    }
  }, [callApi]);

  const deleteHoliday = useCallback(async (id: number): Promise<void> => {
    try {
      return await callApi(
        () => axios.delete(`${API_URL}/hr/holidays/${id}`),
        { loadingMessage: 'Deleting holiday...' }
      );
    } catch (error) {
      // Fallback to mock behavior if API not available
      console.warn('Holiday API not available, using mock behavior:', error);
      // Remove from mock data for this session
      const index = mockHolidays.findIndex(h => h.id === id);
      if (index !== -1) {
        mockHolidays.splice(index, 1);
      }
    }
  }, [callApi]);

  // Calendar Configuration
  const getCalendarConfig = useCallback(async (): Promise<CalendarConfig[]> => {
    try {
      return await callApi(
        () => axios.get(`${API_URL}/hr/calendar-config`).then(res => res.data),
        { loadingMessage: 'Loading calendar configuration...' }
      );
    } catch (error) {
      // Fallback to mock data if API not available
      console.warn('Calendar Config API not available, using mock data:', error);
      return mockCalendarConfig;
    }
  }, [callApi]);

  const updateCalendarConfig = useCallback(async (configs: CalendarConfig[]): Promise<CalendarConfig[]> => {
    try {
      return await callApi(
        () => axios.put(`${API_URL}/hr/calendar-config`, { configs }).then(res => res.data),
        { loadingMessage: 'Updating calendar configuration...' }
      );
    } catch (error) {
      // Fallback to mock behavior if API not available
      console.warn('Calendar Config API not available, using mock behavior:', error);
      return configs;
    }
  }, [callApi]);

  // HR Configuration
  const getHRConfigs = useCallback(async (): Promise<HRConfig[]> => {
    try {
      return await callApi(
        () => axios.get(`${API_URL}/hr/config`).then(res => res.data),
        { loadingMessage: 'Loading HR configuration...' }
      );
    } catch (error) {
      // Fallback to mock data if API not available
      console.warn('HR Config API not available, using mock data:', error);
      return mockHRConfigs;
    }
  }, [callApi]);

  const updateHRConfig = useCallback(async (configKey: string, configValue: string): Promise<HRConfig> => {
    try {
      return await callApi(
        () => axios.put(`${API_URL}/hr/config/${configKey}`, { configValue }).then(res => res.data),
        { loadingMessage: 'Updating HR configuration...' }
      );
    } catch (error) {
      // Fallback to mock behavior if API not available
      console.warn('HR Config API not available, using mock behavior:', error);
      return { configKey, configValue };
    }
  }, [callApi]);

  // Attendance Validation
  const validateAttendanceDate = useCallback(async (date: string): Promise<{
    isValid: boolean;
    message?: string;
    canOverride?: boolean;
  }> => {
    try {
      // Get all required data for validation
      const [hrConfigs, calendarConfigs, holidays] = await Promise.all([
        getHRConfigs(),
        getCalendarConfig(), 
        getHolidays()
      ]);

      const dateObj = dayjs(date);
      const dayOfWeek = dateObj.format('dddd') as CalendarConfig['dayOfWeek'];
      
      // Check HR configs
      const restrictNonWorkingDays = hrConfigs.find(c => c.configKey === 'restrict_attendance_non_working_days')?.configValue === 'true';
      const allowPastDates = hrConfigs.find(c => c.configKey === 'allow_past_date_attendance')?.configValue === 'true';
      const allowFutureDates = hrConfigs.find(c => c.configKey === 'allow_future_date_attendance')?.configValue === 'true';

      // Check if date is in the past
      if (!allowPastDates && dateObj.isBefore(dayjs(), 'day')) {
        return {
          isValid: false,
          message: 'Attendance marking for past dates is not allowed',
          canOverride: false
        };
      }

      // Check if date is in the future
      if (!allowFutureDates && dateObj.isAfter(dayjs(), 'day')) {
        return {
          isValid: false,
          message: 'Attendance marking for future dates is not allowed',
          canOverride: false
        };
      }

      // If restriction is disabled, allow all dates
      if (!restrictNonWorkingDays) {
        return { isValid: true };
      }

      // Check if it's a working day
      const dayConfig = calendarConfigs.find(c => c.dayOfWeek === dayOfWeek);
      if (!dayConfig?.isWorkingDay) {
        return {
          isValid: false,
          message: `${dayOfWeek} is configured as a non-working day. Attendance marking is not allowed.`,
          canOverride: false
        };
      }

      // Check if it's a holiday
      const holiday = holidays.find(h => 
        dayjs(h.holidayDate).isSame(dateObj, 'day') && h.isActive
      );
      if (holiday) {
        return {
          isValid: false,
          message: `${holiday.name} is a company holiday. Attendance marking is not allowed.`,
          canOverride: false
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating attendance date:', error);
      return {
        isValid: false,
        message: 'Unable to validate date. Please try again.',
        canOverride: false
      };
    }
  }, [getHRConfigs, getCalendarConfig, getHolidays]);

  // Comp-off and Overtime Calculation
  const calculateCompensation = useCallback(async (date: string, workHours: number = 8): Promise<{
    suggestedPayMultiplier: number;
    suggestedCompOffDays: number;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
    compensationOptions: string[];
  }> => {
    try {
      const [hrConfigs, calendarConfigs, holidays] = await Promise.all([
        getHRConfigs(),
        getCalendarConfig(),
        getHolidays()
      ]);

      const dateObj = dayjs(date);
      const dayOfWeek = dateObj.format('dddd') as CalendarConfig['dayOfWeek'];
      
      // Check if it's a working day
      const dayConfig = calendarConfigs.find(c => c.dayOfWeek === dayOfWeek);
      const isWeekend = !dayConfig?.isWorkingDay;
      
      // Check if it's a holiday
      const holiday = holidays.find(h => 
        dayjs(h.holidayDate).isSame(dateObj, 'day') && h.isActive
      );
      const isHoliday = !!holiday;

      // Get configuration values
      const weekendPayMultiplier = parseFloat(hrConfigs.find(c => c.configKey === 'weekend_work_pay_multiplier')?.configValue || '1.5');
      const holidayPayMultiplier = parseFloat(hrConfigs.find(c => c.configKey === 'holiday_work_pay_multiplier')?.configValue || '2.0');
      const compOffRatio = parseFloat(hrConfigs.find(c => c.configKey === 'comp_off_earning_ratio')?.configValue || '1.0');
      const weekendGeneratesCompOff = hrConfigs.find(c => c.configKey === 'weekend_work_generates_comp_off')?.configValue === 'true';
      const holidayGeneratesCompOff = hrConfigs.find(c => c.configKey === 'holiday_work_generates_comp_off')?.configValue === 'true';
      const compensationChoice = hrConfigs.find(c => c.configKey === 'comp_off_vs_overtime_pay_choice')?.configValue || 'choice';

      let suggestedPayMultiplier = 1.0;
      let suggestedCompOffDays = 0;
      let compensationOptions: string[] = [];

      if (isHoliday) {
        suggestedPayMultiplier = holidayPayMultiplier;
        suggestedCompOffDays = holidayGeneratesCompOff ? compOffRatio : 0;
        
        if (compensationChoice === 'choice') {
          compensationOptions = ['overtime_pay', 'comp_off'];
        } else if (compensationChoice === 'comp_off') {
          compensationOptions = ['comp_off'];
        } else {
          compensationOptions = ['overtime_pay'];
        }
      } else if (isWeekend) {
        suggestedPayMultiplier = weekendPayMultiplier;
        suggestedCompOffDays = weekendGeneratesCompOff ? compOffRatio : 0;
        
        if (compensationChoice === 'choice') {
          compensationOptions = ['overtime_pay', 'comp_off'];
        } else if (compensationChoice === 'comp_off') {
          compensationOptions = ['comp_off'];
        } else {
          compensationOptions = ['overtime_pay'];
        }
      } else {
        // Regular working day
        compensationOptions = ['overtime_pay'];
      }

      return {
        suggestedPayMultiplier,
        suggestedCompOffDays,
        isWeekend,
        isHoliday,
        holidayName: holiday?.name,
        compensationOptions
      };
    } catch (error) {
      console.error('Error calculating compensation:', error);
      return {
        suggestedPayMultiplier: 1.0,
        suggestedCompOffDays: 0,
        isWeekend: false,
        isHoliday: false,
        compensationOptions: ['overtime_pay']
      };
    }
  }, [getHRConfigs, getCalendarConfig, getHolidays]);

  return {
    // Attendance
    getAttendance,
    markAttendance,
    markBulkAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceReport,
    checkLeaveConflict,
    // Leave
    getLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    getLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    getLeaveBalance,
    allocateLeaveBalance,
    autoAllocateLeaveBalance,
    // Master Data
    getWorkers,
    // Holidays
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    // Calendar Configuration
    getCalendarConfig,
    updateCalendarConfig,
    // HR Configuration
    getHRConfigs,
    updateHRConfig,
    // Attendance Validation
    validateAttendanceDate,
    // Comp-off and Overtime Calculation
    calculateCompensation,
  };
}; 