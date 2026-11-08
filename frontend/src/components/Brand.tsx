import type { CSSProperties } from 'react';
export function Brand({ light=false, compact=false, style }: {light?:boolean; compact?:boolean; style?:CSSProperties}) {
 return <div className={`brand ${light?'brand-light':''}`} style={style} aria-label="Brightloop">
  <svg className="brand-symbol" width="42" height="42" viewBox="0 0 56 56" fill="none" role="img" aria-label="Brightloop infinity symbol">
   <defs><linearGradient id="brandBlue" x1="4" y1="7" x2="55" y2="50"><stop stopColor="#60CAFF"/><stop offset=".53" stopColor="#1681FA"/><stop offset="1" stopColor="#1552D9"/></linearGradient><linearGradient id="brandGold" x1="0" y1="25" x2="54" y2="42"><stop stopColor="#FFD44B"/><stop offset="1" stopColor="#FF9C20"/></linearGradient></defs>
   <path d="M6 34C13 20 19 16 27 23L36 32C43 39 49 32 52 25" stroke="url(#brandGold)" strokeWidth="8" strokeLinecap="round"/>
   <path d="M5 29C12 15 18 10 27 18L37 29C44 38 49 33 53 24" stroke="url(#brandBlue)" strokeWidth="8" strokeLinecap="round"/>
   <path d="M8 38C14 42 20 39 28 30L40 18C45 13 50 16 52 20" stroke="url(#brandBlue)" strokeWidth="7" strokeLinecap="round"/>
  </svg>
  {!compact && <span className="brand-word">bright<span>loop</span><small>SUBSCRIPTIONS, SIMPLIFIED</small></span>}
 </div>
}
