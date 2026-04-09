'use client';

interface RequirementsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RequirementsEditor({
  value,
  onChange,
}: RequirementsEditorProps) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <label className="block text-sm font-medium text-slate-700">
        요구사항 입력
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="프로젝트의 요구사항을 자유롭게 입력하세요. 예: 협업 도구, 채팅 기능, 실시간 알림 등..."
        className="flex-1 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
      />
    </div>
  );
}
