
import { Template, ShiftType } from './types';

export const TEAMS = ['采煤一队', '采煤二队', '机电科', '通风科', '运输队'];
export const SHIFTS = [ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: '采煤工作面日常巡检',
    category: '采煤',
    items: ['液压支架压力', '采煤机喷雾', '刮板机运转', '通风断面瓦斯']
  },
  {
    id: 't2',
    name: '配电室机电安全巡检',
    category: '机电',
    items: ['电缆绝缘状态', '开关柜指示灯', '绝缘工器具', '灭火器效期']
  },
  {
    id: 't3',
    name: '通风系统专项排查',
    category: '通风',
    items: ['主扇运行参数', '风门密闭程度', '局部通风机状态', '测风点风速']
  }
];
