
import { InspectionRecord, User, InspectionStatus, ShiftType, LocationDef } from './types';

// 内存存储巡检记录
let memoryRecords: InspectionRecord[] = [
  {
    id: '1',
    location: '主斜井皮带机房',
    locationCode: 'S-01-A',
    team: '采煤一队',
    shift: ShiftType.MORNING,
    inspector: '张三',
    timestamp: Date.now() - 1000 * 60 * 60,
    overallStatus: InspectionStatus.ABNORMAL,
    items: [
      { id: 'i1', name: '电机温度', result: 'ABNORMAL', photos: [], remark: '温度偏高，需注油' }
    ]
  }
];

// 初始地点库数据
let memoryLocations: LocationDef[] = [
  { id: 'l1', name: '中央变电所', code: 'P-08-MAIN', area: '变电所', hasNFC: true, hasQR: true, nfcTagId: 'NFC_001' },
  { id: 'l2', name: '主斜井皮带机', code: 'S-01-A', area: '运输线', hasNFC: true, hasQR: true },
  { id: 'l3', name: '1201工作面机头', code: 'W-12-HEAD', area: '采煤区', hasNFC: false, hasQR: true },
  { id: 'l4', name: '通风机房 2#', code: 'V-02-B', area: '通风部', hasNFC: false, hasQR: false },
  { id: 'l5', name: '临时水仓', code: 'W-TMP-01', area: '水处理', hasNFC: false, hasQR: false },
];

let currentUser: User | null = { username: '张三', team: '采煤一队', role: '巡检员' };

export const db = {
  // 巡检记录
  getInspections: (): InspectionRecord[] => [...memoryRecords],
  saveInspection: (record: InspectionRecord) => {
    const index = memoryRecords.findIndex(r => r.id === record.id);
    if (index >= 0) {
      memoryRecords[index] = { ...record };
    } else {
      memoryRecords = [record, ...memoryRecords];
    }
  },
  deleteInspection: (id: string) => {
    memoryRecords = memoryRecords.filter(r => r.id !== id);
  },

  // 地点库管理
  getLocations: (): LocationDef[] => [...memoryLocations],
  saveLocation: (loc: LocationDef) => {
    const index = memoryLocations.findIndex(l => l.id === loc.id);
    if (index >= 0) {
      memoryLocations[index] = { ...loc };
    } else {
      memoryLocations = [loc, ...memoryLocations];
    }
  },
  deleteLocation: (id: string) => {
    memoryLocations = memoryLocations.filter(l => l.id !== id);
  },

  // 用户与配置
  getCurrentUser: (): User | null => currentUser,
  setCurrentUser: (user: User | null) => { currentUser = user; },
  clearAll: () => { 
    memoryRecords = [];
    memoryLocations = [];
  }
};
