// Primitives.jsx — shared Button, Input, Chip, Icon
const { useState } = React;

const I = {
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>,
  Zap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  Pencil: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.17 6.8a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.36-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/></svg>,
  Trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  ArrowRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Menu: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  LogOut: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Settings: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  X: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Copy: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Refresh: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  ChevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
};

function Button({ variant = 'primary', size = 'md', children, icon, className = '', ...props }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, borderRadius: 8, border: '1px solid transparent', cursor: 'pointer', transition: 'background 150ms, color 150ms', fontFamily: 'inherit', lineHeight: 1 };
  const sizes = { sm: { padding: '8px 14px', fontSize: 13 }, md: { padding: '10px 20px', fontSize: 14 }, lg: { padding: '12px 24px', fontSize: 14 } };
  const variants = {
    primary: { background: 'var(--brand-primary)', color: '#fff' },
    secondary: { background: 'var(--color-surface-muted)', color: 'var(--color-text-body)' },
    ghost: { background: 'transparent', color: 'var(--color-text-body)', border: '1px solid var(--color-border-hover)' },
    tinted: { background: 'var(--brand-primary-50)', color: 'var(--brand-primary-ink)' },
  };
  const [hover, setHover] = useState(false);
  const hoverBg = { primary: 'var(--brand-primary-700)', secondary: 'var(--color-border)', ghost: 'var(--color-surface-muted)', tinted: 'var(--brand-primary-100)' };
  const style = { ...base, ...sizes[size], ...variants[variant], ...(hover && { background: hoverBg[variant] }), ...(props.disabled && { background: 'var(--color-border-hover)', color: 'var(--color-surface)', cursor: 'not-allowed' }) };
  return <button {...props} className={className} style={{ ...style, ...(props.style||{}) }} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>{icon}{children}</button>;
}

function Input({ style, ...p }) {
  const [focus, setFocus] = useState(false);
  const base = { width: '100%', padding: '10px 14px', border: `1px solid ${focus ? 'var(--brand-primary)' : 'var(--color-border-hover)'}`, borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxShadow: focus ? '0 0 0 1px var(--brand-primary)' : 'none', background: 'var(--color-surface)', color: 'var(--color-text)' };
  return <input {...p} style={{...base, ...style}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} />;
}

function Textarea({ style, ...p }) {
  const [focus, setFocus] = useState(false);
  const base = { width: '100%', padding: '12px 14px', border: `1px solid ${focus ? 'var(--brand-primary)' : 'var(--color-border-hover)'}`, borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxShadow: focus ? '0 0 0 1px var(--brand-primary)' : 'none', background: 'var(--color-surface)', color: 'var(--color-text)', resize: 'vertical' };
  return <textarea {...p} style={{...base, ...style}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} />;
}

function Chip({ tone='slate', border=true, children, style }) {
  const tones = {
    red:    { bg: 'var(--moscow-must-bg)',   fg: 'var(--moscow-must-ink)',   bd: 'var(--moscow-must-border)' },
    orange: { bg: 'var(--moscow-should-bg)', fg: 'var(--moscow-should-ink)', bd: 'var(--moscow-should-border)' },
    yellow: { bg: 'var(--moscow-could-bg)',  fg: 'var(--moscow-could-ink)',  bd: 'var(--moscow-could-border)' },
    slate:  { bg: 'var(--color-surface-muted)', fg: 'var(--color-text-sub)', bd: 'var(--color-border)' },
    indigo: { bg: 'var(--brand-primary-50)', fg: 'var(--brand-primary-ink)', bd: 'var(--brand-primary-100)' },
    green:  { bg: 'var(--color-success-bg)', fg: 'var(--color-success-ink)', bd: 'var(--color-success)' },
  };
  const t = tones[tone] || tones.slate;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:500, background:t.bg, color:t.fg, border: border?`1px solid ${t.bd}`:'none', ...style }}>{children}</span>;
}

Object.assign(window, { I, Button, Input, Textarea, Chip });
