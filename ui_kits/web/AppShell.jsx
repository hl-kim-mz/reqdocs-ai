// AppShell.jsx — Topbar + Sidebar + content (token-based, dark-mode ready)
const { useState: useStateAS } = React;

function Topbar({ onToggle, userName = '기획자' }) {
  return (
    <header style={{ height: 64, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 }}>
      <button onClick={onToggle} style={{ padding: 8, background:'transparent', border: 0, borderRadius: 8, cursor: 'pointer', display:'inline-flex', color:'var(--color-text-body)' }}>
        <I.Menu width={20} height={20}/>
      </button>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 14, color: 'var(--color-text-body)' }}>{userName}</span>
      <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', fontSize:13, color:'var(--color-text-body)', background:'transparent', border:0, borderRadius:8, cursor:'pointer' }}>
        <I.LogOut width={15} height={15}/> 로그아웃
      </button>
    </header>
  );
}

function Sidebar({ open, current, onNav, projects }) {
  if (!open) return <aside style={{ width: 0, overflow: 'hidden', transition: 'width 300ms' }}/>;
  return (
    <aside style={{ width: 240, background:'var(--color-surface)', borderRight:'1px solid var(--color-border)', display:'flex', flexDirection:'column', flexShrink: 0 }}>
      <div style={{ padding: '22px 24px 20px', borderBottom:'1px solid var(--color-border)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color:'var(--brand-primary)' }}>ReqDocs <span style={{color:'var(--color-text-sub)', fontWeight:500}}>AI</span></div>
      </div>
      <nav style={{ padding: 16, display:'flex', flexDirection:'column', gap: 4, flex: 1 }}>
        <NavItem active={current==='new'} onClick={()=>onNav('new')} icon={<I.Plus width={18} height={18}/>}>새 프로젝트</NavItem>
        {projects.length > 0 && <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--color-text-sub)', padding:'14px 14px 6px' }}>최근 프로젝트</div>}
        {projects.map(p => <SubItem key={p.id}>{p.title}</SubItem>)}
      </nav>
      <div style={{ padding: 16, borderTop:'1px solid var(--color-border)' }}>
        <NavItem small icon={<I.Settings width={16} height={16}/>}>설정</NavItem>
      </div>
    </aside>
  );
}

function NavItem({ active, onClick, icon, children, small }) {
  const [hover, setHover] = useStateAS(false);
  const bg = active ? 'var(--brand-primary-50)' : (hover ? 'var(--color-surface-muted)' : 'transparent');
  const color = active ? 'var(--brand-primary-ink)' : 'var(--color-text-body)';
  return (
    <button onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding: small?'8px 14px':'11px 14px', borderRadius:8, background:bg, color, border:0, fontSize:14, fontWeight:active?600:400, cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}>
      {icon}{children}
    </button>
  );
}
function SubItem({ children }) {
  const [hover, setHover] = useStateAS(false);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 14px', borderRadius:8, background: hover?'var(--color-surface-muted)':'transparent', fontSize:13, color:'var(--color-text-body)', cursor:'pointer' }}>
      <I.FileText width={14} height={14} style={{ color:'var(--color-text-sub)', flexShrink:0 }}/> <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{children}</span>
    </div>
  );
}

function AppShell({ children, currentNav, onNav, projects, padded = true }) {
  const [open, setOpen] = useStateAS(true);
  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--color-surface-sub)', fontFamily:'var(--font-sans)', color:'var(--color-text)' }}>
      <Topbar onToggle={()=>setOpen(v=>!v)} />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <Sidebar open={open} current={currentNav} onNav={onNav} projects={projects}/>
        <main style={{ flex:1, overflow:'auto', padding: padded ? '32px 40px' : 0 }}>{children}</main>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell, Topbar, Sidebar });
