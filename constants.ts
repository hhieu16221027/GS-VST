
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

export const PROFESSIONS: Profession[] = ["Bác sĩ", "DD/HS/KTY", "Hộ lý", "Khác"];

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
  { username: 'hhieu.ksnk', password: 'hhieu.ksnk', fullName: 'Bs. Hiếu', role: 'admin' },
  { username: 'ntbthuy.ksnk', password: 'ntbthuy.ksnk', fullName: 'Bs. Thuỷ', role: 'observer' },
  { username: 'cpduyen.ksnk', password: 'cpduyen.ksnk', fullName: 'DDT. Duyên', role: 'observer' },
  { username: 'ttbphuong.ksnk', password: 'ttbphuong.ksnk', fullName: 'Dd. Phương', role: 'observer' },
  { username: 'pthien.ksnk', password: 'pthien.ksnk', fullName: 'Dd. Hiền', role: 'observer' },
  { username: 'vttam.ksnk', password: 'vttam.ksnk', fullName: 'Dd. Tâm', role: 'observer' },
  { username: 'htkchau.ksnk', password: 'htkchau.ksnk', fullName: 'PTK. Châu', role: 'observer' }
];
