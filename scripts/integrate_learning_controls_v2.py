from pathlib import Path
P=Path(__file__).resolve().parents[1]
p=P/'learning-controls-v2.js';s=p.read_text();needle="root.addEventListener('resize',mountFlash);";assert needle in s
s=s.replace(needle,needle+"\nnew MutationObserver(ms=>{if(dock&&ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('iframe')||n.querySelector?.('iframe')))))requestAnimationFrame(viewport);}).observe(document.documentElement,{childList:true,subtree:true});")
p.write_text(s)
print('Late-injected hosting badge reserves space inside the bottom dock.')
