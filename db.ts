
import { InspectionRecord, User, InspectionStatus, ShiftType } from './types';

// 内存存储，不写入 localStorage，避免 QuotaExceededError
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
  },
  {
    id: '2',
    location: '1201综采工作面',
    locationCode: 'W-12-C',
    team: '采煤一队',
    shift: ShiftType.MORNING,
    inspector: '张三',
    timestamp: Date.now() - 1000 * 60 * 120,
    overallStatus: InspectionStatus.NORMAL,
    items: [
      { id: 'i2', name: '支架压力', result: 'NORMAL', photos: [] }
    ]
  }
];

let currentUser: User | null = { username: '张三', team: '采煤一队', role: '巡检员' };

export const db = {
  getInspections: (): InspectionRecord[] => [...memoryRecords],
  saveInspection: (record: InspectionRecord) => {
    const index = memoryRecords.findIndex(r => r.id === record.id);
    if (index >= 0) {
      memoryRecords[index] = { ...record };
    } else {
      memoryRecords = [record, ...memoryRecords];
    }
    console.log('Mock Save:', record);
  },
  deleteInspection: (id: string) => {
    memoryRecords = memoryRecords.filter(r => r.id !== id);
  },
  getCurrentUser: (): User | null => currentUser,
  setCurrentUser: (user: User | null) => { currentUser = user; },
  clearAll: () => { memoryRecords = []; }
};
