
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

export interface RectifyLog {
  timestamp: number;
  remark: string;
  photos?: string[];
}

export interface InspectionItem {
  id: string;
  name: string;
  result: 'NORMAL' | 'ABNORMAL' | 'N/A';
  photos: string[];
  remark?: string;
}

export interface InspectionRecord {
  id: string;
  location: string;
  locationCode?: string;
  team: string;
  shift: ShiftType;
  inspector: string;
  timestamp: number;
  overallStatus: InspectionStatus;
  remark?: string;
  items: InspectionItem[];
  rectifyLogs?: RectifyLog[];
  // Added reviewResult to support pass/fail status when an inspection is reviewed
  reviewResult?: 'PASS' | 'FAIL';
}

export interface LocationDef {
  id: string;
  name: string;
  code: string;
  area: string;
  hasNFC: boolean;
  hasQR: boolean;
  nfcTagId?: string; // 物理 NFC UID
  qrTagId?: string;  // 外部绑定二维码 ID (若是外部贴纸)
  nfcBindDate?: number;
  qrBindDate?: number;
  lastInspectionDate?: number;
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
