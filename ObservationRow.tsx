import React from 'react';
import { Observation, Department, Profession, Indication, Action, Procedure } from '../types';
import { PROFESSIONS, INDICATIONS, ACTIONS, NON_HYGIENE_ACTIONS } from '../constants';
import { Trash2, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface ObservationRowProps {
  index: number;
  observation: Observation;
  department: Department;
  onUpdate: (id: string, updates: Partial<Observation>) => void;
  onDelete: (id: string) => void;
}

const DEPTS_WITH_PATIENT_TYPE: Department[] = ["Nội - Nhiễm", "Ngoại tổng hợp", "Phụ sản", "Nhi"];

const ObservationRow: React.FC<ObservationRowProps> = ({
  index,
  observation,
  department,
  onUpdate,
  onDelete
}) => {
  const showPatientType = DEPTS_WITH_PATIENT_TYPE.includes(department);
  const isNonHygiene = NON_HYGIENE_ACTIONS.includes(observation.action);

  const handleToggleIndication = (ind: Indication) => {
    const current = observation.indications || [];
    let updated: Indication[];
    if (current.includes(ind)) {
      updated = current.filter(item => item !== ind);
    } else {
      updated = [...current, ind];
    }
    onUpdate(observation.id, { indications: updated });
  };

  const handleActionChange = (action: Action) => {
    if (NON_HYGIENE_ACTIONS.includes(action)) {
      onUpdate(observation.id, { action, procedure: null });
    } else {
      onUpdate(observation.id, {
        action,
        procedure: observation.procedure || "Đúng"
      });
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-sky-100 p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-sky-50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-[14px] flex items-center justify-center">
            {index + 1}
          </span>
          <h3 className="text-[16px] font-black uppercase tracking-wider text-slate-800">
            Lượt quan sát #{index + 1}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onDelete(observation.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Xoá lượt quan sát này"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Tên NV được giám sát */}
      <div className="space-y-2">
        <label className="text-[14px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1.5">
          <User size={16} className="text-blue-500" />
          Nhân viên được giám sát <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nhập họ tên nhân viên y tế được giám sát"
          className="w-full px-5 py-3.5 bg-sky-50/50 border-2 border-transparent focus:border-blue-500 rounded-[16px] text-[15px] outline-none transition-all font-medium"
          value={observation.staffName || ''}
          onChange={(e) => onUpdate(observation.id, { staffName: e.target.value })}
        />
      </div>

      {/* Chức danh */}
      <div className="space-y-2">
        <label className="text-[14px] font-black text-slate-500 uppercase ml-1">
          Chức danh <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROFESSIONS.map(prof => {
            const isSelected = observation.profession === prof;
            return (
              <button
                key={prof}
                type="button"
                onClick={() => onUpdate(observation.id, { profession: prof })}
                className={`py-3 px-3 rounded-[14px] text-[14px] font-bold transition-all text-center border-2 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                {prof}
              </button>
            );
          })}
        </div>
      </div>

      {/* Khu vực (nếu khoa thuộc diện phân loại) */}
      {showPatientType && (
        <div className="space-y-2">
          <label className="text-[14px] font-black text-slate-500 uppercase ml-1">
            Khu vực <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["Nội trú", "Ngoại trú"] as const).map(k => {
              const isSelected = observation.patientType === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onUpdate(observation.id, { patientType: k })}
                  className={`py-3 px-4 rounded-[14px] text-[14px] font-bold transition-all text-center border-2 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 Chỉ định vệ sinh tay (Multi-select) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[14px] font-black text-slate-500 uppercase">
            5 Chỉ định vệ sinh tay <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] font-bold text-slate-400 italic">
            (Có thể chọn nhiều)
          </span>
        </div>
        <div className="space-y-2">
          {INDICATIONS.map((ind, indIdx) => {
            const isSelected = (observation.indications || []).includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => handleToggleIndication(ind)}
                className={`w-full p-3.5 rounded-[14px] text-left transition-all border-2 flex items-start gap-3 ${
                  isSelected
                    ? 'bg-sky-50 border-blue-500 text-blue-900 shadow-sm'
                    : 'bg-slate-50/70 border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <CheckCircle2 size={14} className="stroke-[3]" />}
                </div>
                <div className="text-[14px] font-bold leading-snug">
                  <span className="text-blue-600 mr-1.5">{indIdx + 1}.</span>
                  {ind}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hành động */}
      <div className="space-y-2">
        <label className="text-[14px] font-black text-slate-500 uppercase ml-1">
          Hành động <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIONS.map(act => {
            const isSelected = observation.action === act;
            const isNeg = NON_HYGIENE_ACTIONS.includes(act);
            return (
              <button
                key={act}
                type="button"
                onClick={() => handleActionChange(act)}
                className={`p-3.5 rounded-[14px] text-[14px] font-bold text-left transition-all border-2 flex items-center justify-between ${
                  isSelected
                    ? isNeg
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                    : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{act}</span>
                {isSelected && (
                  <span className={`w-2.5 h-2.5 rounded-full ${isNeg ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quy trình (chỉ hiện khi có VST) */}
      {!isNonHygiene && (
        <div className="space-y-2">
          <label className="text-[14px] font-black text-slate-500 uppercase ml-1">
            Quy trình thực hiện <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["Đúng", "Sai"] as Procedure[]).map(proc => {
              const isSelected = observation.procedure === proc;
              const isRight = proc === "Đúng";
              return (
                <button
                  key={proc || 'none'}
                  type="button"
                  onClick={() => onUpdate(observation.id, { procedure: proc })}
                  className={`py-3 px-4 rounded-[14px] text-[14px] font-black transition-all text-center border-2 ${
                    isSelected
                      ? isRight
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm'
                        : 'bg-rose-50 border-rose-600 text-rose-700 shadow-sm'
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {proc}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ObservationRow;
