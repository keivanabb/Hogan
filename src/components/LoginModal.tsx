import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Check,
  Briefcase,
  LogIn,
  Users,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import { TeamMember, DEFAULT_TEAM_MEMBERS } from '../types/workspace';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (member: TeamMember) => void;
  currentMember: TeamMember | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentMember
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    currentMember?.id || DEFAULT_TEAM_MEMBERS[0].id
  );

  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('ارزیاب ارشد تلنت');
  const [customDepartment, setCustomDepartment] = useState<string>('کمیته ارزیابی روان‌سنجی');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isCustom) {
      if (!customName.trim()) {
        alert('لطفاً نام و نام خانوادگی خود را وارد کنید.');
        return;
      }
      const newMember: TeamMember = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        role: customRole.trim(),
        department: customDepartment.trim(),
        avatarBg: 'bg-indigo-700',
        avatarInitials: customName.trim().slice(0, 2)
      };
      onLogin(newMember);
    } else {
      const found = DEFAULT_TEAM_MEMBERS.find((m) => m.id === selectedId);
      if (found) {
        onLogin(found);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-right relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">ورود اعضای تیم ارزیابی</h3>
              <p className="text-xs text-slate-300">
                انتخاب حساب کاربری جهت دسترسی به سوابق و پرونده‌های شغلی
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>پروفایل کارشناس ارزیاب را انتخاب کنید:</span>
            </span>

            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              {isCustom ? '← انتخاب از لیست اعضا' : '+ ورود با مشخصات دیگر'}
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-2.5">
              {DEFAULT_TEAM_MEMBERS.map((member) => {
                const isSelected = selectedId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedId(member.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${member.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}
                      >
                        {member.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{member.name}</div>
                        <div className="text-xs text-indigo-700 font-medium">{member.role}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{member.department}</div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نام و نام خانوادگی:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: مهندس احسان رحیمی"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سمت سازمانی:
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="مثال: روان‌شناس صنعتی-سازمانی"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  واحد / دپارتمان:
                </label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="مثال: معاونت سرمایه انسانی تلکام"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3 rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود به میز کار پرونده‌ها و موقعیت‌های شغلی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
