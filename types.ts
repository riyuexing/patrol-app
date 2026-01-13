
export enum InspectionStatus {
  NORMAL = 'NORMAL',
  ABNORMAL = 'ABNORMAL',
  RECTIFYING = 'RECTIFYING',
  REVIEWED = 'REVIEWED'
}

export enum ShiftType {
  MORNING = '早班',
  AFTERNOON = '中班',
  NIGHT = '夜班'
}

export enum AbnormalType {
  SAFETY = '安全隐患',
  EQUIPMENT = '设备缺陷',
  MANAGEMENT = '管理问题',
  OTHER = '其他'
}

export enum AbnormalLevel {
  GENERAL = '一般',
  LARGE = '较大',
  CRITICAL = '重大'
}

export interface RectifyLog {
  timestamp: number;
  remark: string;
  photos?: string[];
}

export interface InspectionItem {
  id: string;
  name: string;
  result: 'NORMAL' | 'ABNORMAL' | 'N/A';
  abnormalType?: AbnormalType;
  abnormalLevel?: AbnormalLevel;
  remark?: string;
  photos: string[]; // base64 strings
}

export interface InspectionRecord {
  id: string;
  location: string;
  locationCode?: string;
  team: string;
  shift: ShiftType;
  inspector: string;
  timestamp: number;
  templateName?: string;
  overallStatus: InspectionStatus;
  remark?: string;
  items: InspectionItem[];
  rectifyLogs?: RectifyLog[]; // Support for multiple rectification submissions
  reviewResult?: 'PASS' | 'FAIL';
  latitude?: number;
  longitude?: number;
}

export interface User {
  username: string;
  team: string;
  role: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  items: string[];
}
