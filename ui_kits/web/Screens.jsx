// Screens.jsx — Landing, NewProject, StructureReview, Viewer (token-based for dark mode)
const { useState: useStateS } = React;

const C = {
  surface:      'var(--color-surface)',
  surfaceSub:   'var(--color-surface-sub)',
  surfaceMuted: 'var(--color-surface-muted)',
  border:       'var(--color-border)',
  borderHover:  'var(--color-border-hover)',
  text:         'var(--color-text)',
  textBody:     'var(--color-text-body)',
  textSub:      'var(--color-text-sub)',
  textMuted:    'var(--color-text-muted)',
  brand:        'var(--brand-primary)',
  brandInk:     'var(--brand-primary-ink)',
  brand50:      'var(--brand-primary-50)',
  brand100:     'var(--brand-primary-100)',
  errorBg:      'var(--color-error-bg)',
  error:        'var(--color-error)',
};

function Landing({ onStart }) {
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(to bottom right, ${C.surfaceSub}, ${C.surfaceMuted})`, fontFamily:'var(--font-sans)', color:C.text }}>
      <header style={{ display:'flex', alignItems:'center', padding:'20px 40px', justifyContent:'space-between' }}>
        <div style={{ fontSize:20, fontWeight:700, color:C.brand }}>ReqDocs <span style={{color:C.textSub, fontWeight:500}}>AI</span></div>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" size="sm">로그인</Button>
          <Button variant="primary" size="sm" onClick={onStart}>무료로 시작 <I.ArrowRight width={16} height={16}/></Button>
        </div>
      </header>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'80px 32px 40px', textAlign:'center' }}>
        <div style={{ display:'inline-block', marginBottom:16, padding:'6px 14px', background:C.brand100, borderRadius:999, fontSize:13, color:C.brandInk, fontWeight:600 }}>AI 기반 문서 생성</div>
        <h1 style={{ fontSize:60, fontWeight:700, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:20, color:C.text }}>요구사항에서 문서로<br/><span style={{ color:C.brand }}>한 번에</span></h1>
        <p style={{ fontSize:18, color:C.textBody, maxWidth:560, margin:'0 auto 28px', lineHeight:1.6 }}>회의록 · 이메일 · 기획 메모를 붙여넣으면 Claude AI가 분석하여 PRD · 기능 명세 · API 문서 · ERD를 자동으로 생성합니다.</p>
        <Button size="lg" onClick={onStart}>시작하기 <I.ArrowRight width={18} height={18}/></Button>
      </div>
      <div style={{ maxWidth:900, margin:'20px auto 80px', padding:'0 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {[{icon:<I.FileText width={24} height={24}/>, title:'PRD 자동 생성', desc:'요구사항 분석, 사용자 시나리오, 제약사항까지 포함한 완성된 PRD를 생성합니다.'},
          {icon:<I.Zap width={24} height={24}/>, title:'기능 목록 생성', desc:'MoSCoW 우선순위를 적용한 상세한 기능 목록을 테이블 형식으로 제공합니다.'}].map((f,i)=>(
          <div key={i} style={{ background:C.surface, borderRadius:12, boxShadow:'var(--shadow-sm)', padding:28, border:`1px solid ${C.border}` }}>
            <div style={{ width:44, height:44, background:C.brand100, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, color:C.brandInk }}>{f.icon}</div>
            <h3 style={{ fontSize:18, fontWeight:600, marginBottom:6, color:C.text }}>{f.title}</h3>
            <p style={{ fontSize:14, color:C.textBody, lineHeight:1.6, margin:0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewProject({ onStructure }) {
  const [title, setTitle] = useStateS('쇼핑몰 리뉴얼 요구사항');
  const [input, setInput] = useStateS('');
  const sample = '3월 27일 기획 미팅:\n- 사용자는 이메일/비밀번호로 로그인할 수 있어야 함. 소셜 로그인(Google)도 지원 필요.\n- 상품 검색은 키워드 + 카테고리 필터 지원.\n- 장바구니는 세션 기반 유지, 결제는 토스페이먼츠 연동.\n- 페이지 로딩 속도 3초 이내 목표.\n- 관리자 권한 분리 필수. 최소 3단계 권한.\n\n인증은 필수로 들어가야 한다는 점, 강조함.';
  return (
    <div style={{ display:'flex', gap:32, height:'100%' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:20 }}>
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textBody, marginBottom:6 }}>프로젝트 이름</label>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="프로젝트 이름을 입력하세요"/>
        </div>
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textBody, marginBottom:6 }}>요구사항 입력</label>
          <Textarea rows={14} value={input} onChange={e=>setInput(e.target.value)} placeholder="여기에 요구사항을 붙여넣어 보세요. 정리되지 않아도 됩니다." style={{minHeight:340}}/>
          <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMuted }}>
            <button onClick={()=>setInput(sample)} style={{ background:'transparent', border:0, color:C.brand, fontSize:12, cursor:'pointer', padding:0 }}>샘플 붙여넣기</button>
            <span>{input.length.toLocaleString()} / 10,000</span>
          </div>
        </div>
      </div>
      <div style={{ width:288, display:'flex', flexDirection:'column', gap:14, flexShrink:0 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:10 }}>입력 가이드</h3>
          <ul style={{ margin:0, padding:'0 0 0 16px', fontSize:13, color:C.textBody, lineHeight:1.7 }}>
            <li>회의록, 이메일, 메모 자유롭게 붙여넣기</li>
            <li>정리되지 않아도 됩니다</li>
            <li>AI가 자동으로 분류합니다</li>
          </ul>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:10 }}>생성 흐름</h3>
          <ol style={{ margin:0, padding:'0 0 0 18px', fontSize:13, color:C.textBody, lineHeight:1.8 }}>
            <li>비정형 입력</li>
            <li style={{ color:C.brand, fontWeight:600 }}>AI 요구사항 구조화</li>
            <li>기획자 검토 · 편집</li>
            <li>개발 문서 생성</li>
          </ol>
        </div>
        <Button variant="primary" onClick={onStructure} disabled={!input.trim()} style={{ width:'100%', padding:'12px 20px' }}>
          <I.Zap width={16} height={16}/> 요구사항 구조화 시작
        </Button>
      </div>
    </div>
  );
}

const SAMPLE_REQS = [
  { id:'REQ-001', cat:'기능', title:'사용자 로그인', desc:'이메일/비밀번호로 로그인, 소셜 로그인(Google) 지원', priority:'Must Have', source:'인증은 필수로' },
  { id:'REQ-002', cat:'기능', title:'상품 검색', desc:'키워드 검색 및 카테고리 필터 지원', priority:'Must Have', source:'키워드 + 카테고리 필터' },
  { id:'REQ-003', cat:'기능', title:'장바구니', desc:'세션 기반 장바구니 유지', priority:'Should Have', source:'세션 기반 유지' },
  { id:'REQ-004', cat:'기능', title:'결제 연동', desc:'토스페이먼츠 결제 모듈 연동', priority:'Must Have', source:'토스페이먼츠 연동' },
  { id:'REQ-005', cat:'기능', title:'관리자 권한', desc:'최소 3단계 권한 분리', priority:'Should Have', source:'최소 3단계 권한' },
  { id:'REQ-011', cat:'비기능', title:'응답 시간', desc:'페이지 로딩 3초 이내', priority:'Should Have', source:'3초 이내 목표' },
  { id:'REQ-021', cat:'제약', title:'결제사 제약', desc:'국내 결제만 지원 (토스페이먼츠)', priority:'Could Have', source:'토스페이먼츠 연동' },
];
const MOSCOW_TONE = { 'Must Have':'red', 'Should Have':'orange', 'Could Have':'yellow', "Won't Have":'slate' };

function ReqCard({ req, onDelete }) {
  const [hover, setHover] = useStateS(false);
  const [bdHover, setBdHover] = useStateS(false);
  return (
    <div onMouseEnter={()=>setBdHover(true)} onMouseLeave={()=>setBdHover(false)} style={{ background:C.surface, border:`1px solid ${bdHover?C.borderHover:C.border}`, borderRadius:8, padding:14, transition:'border-color 150ms' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:C.textMuted }}>{req.id}</span>
          <Chip tone={MOSCOW_TONE[req.priority]}>{req.priority} ▾</Chip>
        </div>
        <div style={{ display:'flex', gap:2 }}>
          <button onMouseEnter={()=>setHover('e')} onMouseLeave={()=>setHover(false)} style={{ width:24, height:24, display:'inline-flex', alignItems:'center', justifyContent:'center', background: hover==='e'?C.surfaceMuted:'transparent', border:0, borderRadius:6, cursor:'pointer', color: hover==='e'?C.brand:C.textMuted }}><I.Pencil width={14} height={14}/></button>
          <button onClick={()=>onDelete(req.id)} onMouseEnter={()=>setHover('d')} onMouseLeave={()=>setHover(false)} style={{ width:24, height:24, display:'inline-flex', alignItems:'center', justifyContent:'center', background: hover==='d'?C.errorBg:'transparent', border:0, borderRadius:6, cursor:'pointer', color: hover==='d'?C.error:C.textMuted }}><I.Trash width={14} height={14}/></button>
        </div>
      </div>
      <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:3 }}>{req.title}</div>
      <div style={{ fontSize:12, color:C.textSub, lineHeight:1.55 }}>{req.desc}</div>
      {req.source && <div style={{ fontSize:11, color:C.textMuted, fontStyle:'italic', borderLeft:`2px solid ${C.border}`, paddingLeft:8, marginTop:8 }}>출처: "{req.source}"</div>}
    </div>
  );
}

function StructureReview({ onGenerate }) {
  const [reqs, setReqs] = useStateS(SAMPLE_REQS);
  const [docs, setDocs] = useStateS({ prd:true, feature_list:true, feature_spec:false, api_spec:true, erd:true });
  const cats = ['기능', '비기능', '제약'];
  const catLabels = { '기능':'기능 요구사항', '비기능':'비기능 요구사항', '제약':'제약사항' };
  const selectedCount = Object.values(docs).filter(Boolean).length;
  return (
    <div style={{ display:'flex', gap:24, height:'100%' }}>
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0, color:C.text }}>요구사항 구조화 결과 <span style={{ fontSize:13, fontWeight:400, color:C.textSub, marginLeft:8 }}>총 {reqs.length}개</span></h2>
          <Button variant="ghost" size="sm">원본 보기 <I.ChevronDown width={14} height={14}/></Button>
        </div>
        {cats.map(cat => {
          const list = reqs.filter(r=>r.cat===cat);
          return (
            <div key={cat} style={{ marginBottom:22 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.textBody }}>{catLabels[cat]} <span style={{ color:C.textMuted, fontWeight:400 }}>({list.length})</span></div>
                <button style={{ fontSize:12, color:C.brand, background:'transparent', border:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}><I.Plus width={12} height={12}/> 항목 추가</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {list.map(r => <ReqCard key={r.id} req={r} onDelete={id=>setReqs(reqs.filter(x=>x.id!==id))}/>)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ width:288, flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:12 }}>생성할 문서</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[['prd','PRD'],['feature_list','기능 목록'],['feature_spec','기능 명세서'],['api_spec','API 문서'],['erd','ERD']].map(([k,l])=>(
              <label key={k} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:C.textBody, cursor:'pointer' }}>
                <input type="checkbox" checked={docs[k]} onChange={e=>setDocs({...docs,[k]:e.target.checked})} style={{ accentColor:'var(--brand-primary)', width:16, height:16 }}/>
                {l}
              </label>
            ))}
          </div>
        </div>
        <Button variant="ghost"><I.Refresh width={14} height={14}/> 재분석</Button>
        <Button variant="primary" onClick={onGenerate} disabled={selectedCount===0} style={{padding:'12px 20px'}}>문서 생성 <I.ArrowRight width={16} height={16}/></Button>
        <p style={{ fontSize:12, color:C.textMuted, textAlign:'center', margin:0 }}>요구사항을 검토한 후 문서를 생성하세요</p>
      </div>
    </div>
  );
}

const DOC_CONTENT = {
  prd: `# PRD — 쇼핑몰 리뉴얼 v2

## 제품 개요
본 서비스는 온라인 쇼핑몰 사용자가 상품을 탐색하고 구매하는 플랫폼으로, 기존 대비 전환율과 모바일 UX를 개선하는 것을 목표로 합니다.

## 목표
1. 전환율 20% 향상
2. 이탈률 15% 감소
3. 모바일 UX 개선

## 사용자 시나리오
- 일반 구매자: 로그인 후 상품 검색 → 장바구니 담기 → 결제
- 관리자: 상품 등록, 재고 관리, 주문 확인
`,
  feature_list: `# 기능 목록

- F-001 · 사용자 로그인 · Must Have
- F-002 · 상품 검색 · Must Have
- F-003 · 장바구니 · Should Have
- F-004 · 결제 연동 (토스페이먼츠) · Must Have
- F-005 · 관리자 권한 분리 · Should Have
`,
};

function SidePanel({ docType }) {
  const labels = { prd:'PRD', feature_list:'기능 목록', feature_spec:'기능 명세', api_spec:'API 명세', erd:'ERD' };
  return (
    <div style={{ width:288, flexShrink:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:22, display:'flex', flexDirection:'column', gap:18 }}>
      <div>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', color:C.textSub, marginBottom:8 }}>문서 정보</div>
        <div style={{ fontSize:12, color:C.textSub, marginBottom:2 }}>문서 타입</div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:10 }}>{labels[docType]}</div>
        <div style={{ fontSize:12, color:C.textSub, marginBottom:2 }}>생성 시간</div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>2026-04-20 14:32</div>
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, display:'flex', flexDirection:'column', gap:8 }}>
        <Button variant="secondary" size="sm" icon={<I.Pencil width={15} height={15}/>}>편집</Button>
        <Button variant="secondary" size="sm" icon={<I.Refresh width={15} height={15}/>}>재생성</Button>
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, display:'flex', flexDirection:'column', gap:8 }}>
        <Button variant="tinted" size="sm" icon={<I.Copy width={15} height={15}/>}>마크다운 복사</Button>
        <Button variant="secondary" size="sm" icon={<I.Download width={15} height={15}/>}>다운로드</Button>
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', color:C.textSub, marginBottom:8 }}>통계</div>
        <Stat k="글자 수" v="3,482"/>
        <Stat k="단어 수" v="521"/>
        <Stat k="문단 수" v="18"/>
      </div>
    </div>
  );
}
function Stat({ k, v }) { return <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'2px 0' }}><span style={{ color:C.textBody }}>{k}</span><span style={{ fontWeight:600, color:C.text }}>{v}</span></div>; }

function Markdown({ text }) {
  const html = text.split('\n').map((line) => {
    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
    if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
    if (/^\d+\. /.test(line)) return `<li>${line.replace(/^\d+\. /,'')}</li>`;
    if (!line.trim()) return '<div style="height:8px;"></div>';
    return `<p>${line}</p>`;
  }).join('');
  return <div className="md-content" dangerouslySetInnerHTML={{__html: html}} />;
}

function ApiList() {
  const endpoints = [
    { method:'GET', path:'/api/users', desc:'사용자 목록 조회', color:'var(--method-get)' },
    { method:'POST', path:'/api/users', desc:'사용자 생성', color:'var(--method-post)' },
    { method:'PUT', path:'/api/users/{id}', desc:'사용자 수정', color:'var(--method-put)' },
    { method:'DELETE', path:'/api/users/{id}', desc:'사용자 삭제', color:'var(--method-delete)' },
    { method:'GET', path:'/api/products', desc:'상품 목록 조회', color:'var(--method-get)' },
    { method:'POST', path:'/api/orders', desc:'주문 생성', color:'var(--method-post)' },
  ];
  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
      {endpoints.map((e,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderBottom: i<endpoints.length-1?`1px solid ${C.border}`:'none', background:C.surface }}>
          <span style={{ background:e.color, color:'#fff', padding:'3px 10px', borderRadius:4, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, minWidth:56, textAlign:'center' }}>{e.method}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:C.text, flex:1 }}>{e.path}</span>
          <span style={{ fontSize:13, color:C.textSub }}>{e.desc}</span>
        </div>
      ))}
    </div>
  );
}

function ErdView() {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:32, textAlign:'center' }}>
      <svg viewBox="0 0 600 260" style={{ width:'100%', maxWidth:560 }}>
        <g fontFamily="Monaco, monospace" fontSize="11">
          <rect x="30" y="70" width="120" height="110" rx="6" fill="var(--color-surface)" stroke="var(--color-border-hover)"/>
          <text x="90" y="90" textAnchor="middle" fontWeight="700" fill="var(--color-text)" fontSize="13">users</text>
          <line x1="30" y1="98" x2="150" y2="98" stroke="var(--color-border)"/>
          <text x="40" y="116" fill="var(--brand-primary)">id</text><text x="140" y="116" textAnchor="end" fill="var(--color-text-sub)">PK</text>
          <text x="40" y="136" fill="var(--color-text-body)">email</text>
          <text x="40" y="156" fill="var(--color-text-body)">name</text>

          <rect x="240" y="70" width="140" height="110" rx="6" fill="var(--color-surface)" stroke="var(--color-border-hover)"/>
          <text x="310" y="90" textAnchor="middle" fontWeight="700" fill="var(--color-text)" fontSize="13">orders</text>
          <line x1="240" y1="98" x2="380" y2="98" stroke="var(--color-border)"/>
          <text x="250" y="116" fill="var(--brand-primary)">id</text><text x="370" y="116" textAnchor="end" fill="var(--color-text-sub)">PK</text>
          <text x="250" y="136" fill="var(--color-text-body)">user_id</text><text x="370" y="136" textAnchor="end" fill="var(--color-text-sub)">FK</text>
          <text x="250" y="156" fill="var(--color-text-body)">total_amt</text>

          <rect x="450" y="70" width="130" height="90" rx="6" fill="var(--color-surface)" stroke="var(--color-border-hover)"/>
          <text x="515" y="90" textAnchor="middle" fontWeight="700" fill="var(--color-text)" fontSize="13">order_items</text>
          <line x1="450" y1="98" x2="580" y2="98" stroke="var(--color-border)"/>
          <text x="460" y="116" fill="var(--color-text-body)">order_id</text>
          <text x="460" y="136" fill="var(--color-text-body)">product_id</text>

          <line x1="150" y1="125" x2="240" y2="125" stroke="var(--color-text-sub)" strokeWidth="1.5"/>
          <text x="170" y="120" fill="var(--color-text-muted)" fontSize="10">1</text>
          <text x="220" y="120" fill="var(--color-text-muted)" fontSize="10">n</text>
          <line x1="380" y1="125" x2="450" y2="115" stroke="var(--color-text-sub)" strokeWidth="1.5"/>
        </g>
      </svg>
      <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:18 }}>
        <Button variant="secondary" size="sm">＋ 확대</Button>
        <Button variant="secondary" size="sm">− 축소</Button>
        <Button variant="secondary" size="sm">전체화면</Button>
      </div>
    </div>
  );
}

function Viewer({ projectTitle }) {
  const tabs = [['prd','PRD'],['feature_list','기능 목록'],['feature_spec','기능 명세'],['api_spec','API 문서'],['erd','ERD']];
  const [tab, setTab] = useStateS('prd');
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <I.FileText width={18} height={18} style={{color:C.textSub}}/>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0, color:C.text }}>{projectTitle}</h1>
        </div>
        <Button variant="ghost" size="sm" icon={<I.Download width={14} height={14}/>}>전체 내보내기</Button>
      </div>
      <div style={{ display:'flex', gap:8, borderBottom:`1px solid ${C.border}`, marginTop:18 }}>
        {tabs.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ padding:'12px 16px', background:'transparent', border:0, borderBottom: '2px solid transparent', borderBottomColor: tab===k?C.brand:'transparent', color: tab===k?C.brand:C.textSub, fontWeight: tab===k?600:400, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:20, marginTop:20, flex:1, minHeight:0 }}>
        <div style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'24px 32px', overflow:'auto' }}>
          {tab==='prd' && <Markdown text={DOC_CONTENT.prd}/>}
          {tab==='feature_list' && <Markdown text={DOC_CONTENT.feature_list}/>}
          {tab==='feature_spec' && <div style={{padding:40, textAlign:'center', color:C.textMuted}}>기능 명세서가 선택되지 않았습니다.</div>}
          {tab==='api_spec' && <ApiList/>}
          {tab==='erd' && <ErdView/>}
        </div>
        <SidePanel docType={tab}/>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, NewProject, StructureReview, Viewer });
