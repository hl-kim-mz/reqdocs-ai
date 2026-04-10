'use client';

const MAX_CHARS = 2000;
const WARN_CHARS = 1600;

interface RequirementsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RequirementsEditor({
  value,
  onChange,
}: RequirementsEditorProps) {
  const len = value.length;
  const isOver = len > MAX_CHARS;
  const isWarn = !isOver && len >= WARN_CHARS;

  const counterColor = isOver
    ? 'text-red-500 font-semibold'
    : isWarn
    ? 'text-amber-500 font-medium'
    : 'text-slate-400';

  const borderColor = isOver
    ? 'border-red-400 focus:ring-red-400'
    : isWarn
    ? 'border-amber-400 focus:ring-amber-400'
    : 'border-slate-300 focus:ring-indigo-500';

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          요구사항 입력
        </label>
        <span className={`text-xs tabular-nums ${counterColor}`}>
          {len.toLocaleString()} / {MAX_CHARS.toLocaleString()}자
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="프로젝트의 요구사항을 자유롭게 입력하세요. 예: 협업 도구, 채팅 기능, 실시간 알림 등..."
        className={`flex-1 p-4 border rounded-lg focus:outline-none focus:ring-2 resize-none font-mono text-sm transition-colors ${borderColor}`}
      />

      {isOver && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span>
          2000자를 초과했습니다. 구조화 시작 시 앞 2000자만 분석됩니다.
        </p>
      )}
      {isWarn && (
        <p className="text-xs text-amber-500 flex items-center gap-1">
          <span>⚠</span>
          2000자에 근접하고 있습니다. 초과분은 분석에서 제외됩니다.
        </p>
      )}
    </div>
  );
}
