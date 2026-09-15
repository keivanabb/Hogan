import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Users,
  FolderOpen,
  ArrowLeft,
  X,
  Building2
} from 'lucide-react';
import { JobPosition, TeamMember, StoredDocument } from '../types/workspace';
import { AssessmentReport } from '../types/assessment';

interface PositionSelectScreenProps {
  positions: JobPosition[];
  currentMember: TeamMember;
  savedReports: AssessmentReport[];
  documents: StoredDocument[];
  onOpenPosition: (position: JobPosition) => void;
  onCreatePosition: (position: JobPosition) => void;
}

export const PositionSelectScreen: React.FC<PositionSelectScreenProps> = ({
  positions,
  currentMember,
  savedReports,
  documents,
  onOpenPosition,
  onCreatePosition
}) => {
  const [query, setQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [industry, setIndustry] = useState<string>('مخابرات و تلکام (Telecom & ICT)');
  const [competencies, setCompetencies] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const visible = positions.filter((p) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q)
    );
  });

  const statsFor = (position: JobPosition) => {
    const reports = savedReports.filter(
      (r) => r.positionId === position.id || r.targetJobTitle === position.title
    );
    const docs = documents.filter((d) => d.positionId === position.id);
    const mine = reports.filter((r) => r.ownerId === currentMember.id);
    return { reports: reports.length, docs: docs.length, mine: mine.length };
  };

  const handleCreate = () => {
    if (!title.trim()) {
      alert('عنوان موقعیت شغلی الزامی است.');
      return;
    }

    const newPosition: JobPosition = {
      id: `pos-${Date.now()}`,
      title: title.trim(),
      department: department.trim() || 'واحد تعیین‌نشده',
      industry: industry.trim(),
      competencies: competencies
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
      description: description.trim(),
      createdAt: new Date().toLocaleDateString('fa-IR'),
      defaultJd: {
        jobTitle: title.trim(),
        department: department.trim(),
        industry: industry.trim(),
        requiredCompetencies: competencies.trim()
      }
    };

    onCreatePosition(newPosition);
    setShowCreateModal(false);
    setTitle('');
    setDepartment('');
    setCompetencies('');
    setDescription('');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* بنر خوش‌آمد */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg">
              گام ۱ — انتخاب موقعیت شغلی
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight mt-2">
              {currentMember.name} عزیز، خوش آمدید
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              موقعیت شغلی مورد نظر خود را باز کنید تا مدارک بارگذاری‌شده، سوابق تحلیل و
              پرونده‌های کاندیداهای همان موقعیت در اختیارتان قرار گیرد.
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-xs min-w-[190px]">
            <div className="flex items-center gap-2 font-bold mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${currentMember.avatarBg} flex items-center justify-center font-black text-[11px]`}
              >
                {currentMember.avatarInitials}
              </div>
              <span className="truncate">{currentMember.role}</span>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {currentMember.department}
            </div>
          </div>
        </div>
      </div>

      {/* نوار جست‌وجو و ایجاد */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
          <span>موقعیت‌های شغلی فعال ({positions.length})</span>
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی عنوان یا واحد..."
              className="text-xs w-56 pr-8 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>موقعیت شغلی جدید</span>
          </button>
        </div>
      </div>

      {/* کارت‌های موقعیت */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((position) => {
          const stats = statsFor(position);
          return (
            <button
              key={position.id}
              type="button"
              onClick={() => onOpenPosition(position)}
              className="text-right bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-2xl p-5 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{position.createdAt}</span>
              </div>

              <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-700 transition">
                {position.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">{position.department}</p>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed flex-1">
                {position.description}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div>
                  <div className="text-sm font-black text-slate-900">{stats.reports}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>پرونده</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{stats.docs}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>مدرک</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-black text-indigo-700">{stats.mine}</div>
                  <div className="text-[10px] text-slate-500">تحلیل من</div>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-bold text-indigo-600 flex items-center gap-1 justify-end">
                <span>ورود به میز کار این موقعیت</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}

        {visible.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
            <p className="text-sm font-bold text-slate-600">موقعیتی با این عنوان یافت نشد.</p>
            <p className="text-xs text-slate-400 mt-1">
              می‌توانید با دکمه «موقعیت شغلی جدید» آن را تعریف کنید.
            </p>
          </div>
        )}
      </div>

      {/* مودال ایجاد موقعیت */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-base font-black text-slate-900">تعریف موقعیت شغلی جدید</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان موقعیت <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مدیر تحول دیجیتال"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">واحد سازمانی</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">صنعت</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شایستگی‌های کلیدی (هر مورد در یک خط)
                </label>
                <textarea
                  rows={4}
                  value={competencies}
                  onChange={(e) => setCompetencies(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شرح کوتاه نقش</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3 rounded-2xl transition cursor-pointer mt-2"
              >
                ثبت موقعیت و ورود به میز کار آن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
