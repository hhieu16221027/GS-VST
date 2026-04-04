
import { Department, Profession, Indication, Action } from './types';

export const DEPARTMENTS: Department[] = [
  "Hồi sức cấp cứu",
  "Nội - Nhiễm",
  "Ngoại tổng hợp",
  "Phụ sản",
  "Nhi",
  "Răng - Hàm - Mặt",
  "Tai - Mũi - Họng",
  "Mắt"
];

export const PROFESSIONS: Profession[] = ["Bác sĩ", "DD/HS/KTV", "Hộ lý", "Khác"];

export const INDICATIONS: Indication[] = [
  "Trước tiếp xúc người bệnh",
  "Trước thủ thuật vô khuẩn/sạch",
  "Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể",
  "Sau tiếp xúc người bệnh",
  "Sau tiếp xúc môi trường xung quanh người bệnh"
];

export const ACTIONS: Action[] = [
  "VST với cồn",
  "VST với xà phòng và nước",
  "Không VST",
  "Mang găng và không VST"
];

export const NON_HYGIENE_ACTIONS: Action[] = ["Không VST", "Mang găng và không VST"];

export const AUTH_KEY = 'hand_hygiene_auth_v2';

export const ALLOWED_USERS = [
  { username: 'hhieu.ksnk', password: 'hohieuksnk', fullName: 'Bs. Hiếu', role: 'admin' },
  { username: 'duyen.ksnk', password: 'cpduyenksnk', fullName: 'DDT. Duyên', role: 'observer' },
  { username: 'thuy.ksnk', password: 'ntbthuyksnk', fullName: 'Bs. Thuỷ', role: 'observer' }
  { username: 'phuong.ksnk', password: 'ttbphuongksnk', fullName: 'Dd. Phương', role: 'observer' }
  { username: 'hien.ksnk', password: 'pthienksnk', fullName: 'Dd. Hiền', role: 'observer' }
  { username: 'tam.ksnk', password: 'vttamksnk', fullName: 'Dd. Tâm', role: 'observer' }
];
