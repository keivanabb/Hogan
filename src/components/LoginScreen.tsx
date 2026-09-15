import React, { useState } from 'react';
import {
  ShieldCheck,
  LogIn,
  Users,
  Check,
  Lock,
  Info,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { TeamMember, DEFAULT_TEAM_MEMBERS } from '../types/workspace';

interface LoginScreenProps {
  onLogin: (member: TeamMember) => void;
  savedMembers: TeamMember[];
  lastMemberId?: string;
}

const PIN_STORAGE_KEY = 'hr_talent_local_pins_v1';

function loadPins(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePin(memberId: string, pin: string): void {
  try {
    const pins = loadPins();
    if (pin) {
      pins[memberId] = pin;
    } else {
      delete pins[memberId];
    }
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
  } catch (err) {
    console.error('خطا در ذخیره قفل محلی:', err);
  }
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  savedMembers,
  lastMemberId
}) => {
  const allMembers = [
    ...DEFAULT_TEAM_MEMBERS,
    ...savedMembers.filter((m) => !DEFAULT_TEAM_MEMBERS.some((d) => d.id === m.id))
  ];

  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [selectedId, setSelectedId] = useState<string>(lastMemberId || allMembers[0]?.id || '');
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('ارزیاب ارشد تلنت');
  const [newDepartment, setNewDepartment] = useState<string>('کمیته ارزیابی روان‌سنجی');
  const [newPin, setNewPin] = useState<string>('');

  const pins = loadPins();
  const selectedMember = allMembers.find((m) => m.id === selectedId);
  const selectedHasPin = Boolean(selectedMember && pins[selectedMember.id]);

  const handleSignIn = () => {
    setError('');
    if (!selectedMember) {
      setError('لطفاً یک حساب کاربری انتخاب کنید.');
      return;
    }

    if (selectedHasPin && pinInput !== pins[selectedMember.id]) {
      setError('رمز محلی وارد شده صحیح نیست.');
      return;
    }

    onLogin(selectedMember);
  };

  const handleCreateAndSignIn = () => {
    setError('');
    if (!newName.trim()) {
      setError('نام و نام خانوادگی الزامی است.');
      return;
    }
    if (newPin && !/^\d{4,6}$/.test(newPin)) {
      setError('رمز محلی باید عددی و بین ۴ تا ۶ رقم باشد.');
      return;
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'ارزیاب تلنت',
      department: newDepartment.trim() || 'کمیته ارزیابی',
      avatarBg: 'bg-indigo-700',
      avatarInitials: newName.trim().slice(0, 2)
    };

    if (newPin) savePin(member.id, newPin);
    onLogin(member);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        {/* ستون معرفی سامانه */}
        <div className="lg:col-span-2 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black leading-snug">
              سامانه ارزیابی استراتژیک تلنت و روان‌سنجی شغلی
            </h1>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              برای ورود، حساب کارشناسی خود را انتخاب کنید. پس از ورود، فهرست موقعیت‌های شغلی
              نمایش داده می‌شود و در هر موقعیت به مدارک بارگذاری‌شده و سوابق تحلیل خود دسترسی
              خواهید داشت.
            </p>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-200 mt-8">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>میز کار مجزا برای هر موقعیت شغلی</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>بایگانی مدارک و امکان فراخوانی مجدد پرونده‌ها</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>ثبت مدارک به‌صورت صفحه‌به‌صفحه و بدون شلوغی</span>
            </li>
          </ul>

          <div className="mt-8 flex items-start gap-2 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3">
            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-100 leading-relaxed">
              داده‌ها روی همین مرورگر ذخیره می‌شوند و رمز ورود صرفاً یک «قفل محلی» است؛
              جایگزین احراز هویت سمت سرور نیست.
            </p>
          </div>
        </div>

        {/* ستون فرم ورود */}
        <div className="lg:col-span-3 p-8 text-right">
          {mode === 'select' ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>ورود اعضای تیم ارزیابی</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode('new');
                    setError('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>حساب کاربری جدید</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pl-1">
                {allMembers.map((member) => {
                  const isSelected = selectedId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(member.id);
                        setPinInput('');
                        setError('');
                      }}
                      className={`w-full text-right p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${member.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0`}
                        >
                          {member.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{member.name}</div>
                          <div className="text-xs text-indigo-700 font-medium">{member.role}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{member.department}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {pins[member.id] && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedHasPin && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>رمز محلی این حساب:</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    placeholder="رمز ۴ تا ۶ رقمی"
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-widest text-center"
                  />
                </div>
              )}

              {error && (
                <p className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSignIn}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود و مشاهده موقعیت‌های شغلی</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <span>ساخت حساب کارشناس جدید</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode('select');
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>بازگشت به فهرست اعضا</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: مهندس احسان رحیمی"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">سمت سازمانی</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">واحد / دپارتمان</label>
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز محلی (اختیاری — ۴ تا ۶ رقم)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="در صورت خالی بودن، ورود بدون رمز انجام می‌شود"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleCreateAndSignIn}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ثبت حساب و ورود</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
