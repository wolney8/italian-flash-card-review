from pathlib import Path
import subprocess
P=Path(__file__).resolve().parents[1]
p=P/'study/study-editorial-v1.js';s=p.read_text();old="root.querySelectorAll('.check-button')";assert old in s;s=s.replace(old,"root.querySelectorAll('.check-button:not([data-ui-no-translate])')");s=s.replace("root.querySelectorAll('.hint-button')","root.querySelectorAll('.hint-button:not([data-ui-no-translate])')");p.write_text(s)
p=P/'study/study-sheets.html';s=p.read_text();import re;s=re.sub(r'(study-editorial-v1\.js\?v=)[^"\s]+',r'\g<1>20261112flow',s);p.write_text(s)
p=P/'scripts/validate_learning_session.cjs';s=p.read_text();s=s.replace('total:3,known:1,again:1,rated:2,unrated:1','total:3,known:1,again:1,unsure:0,rated:2,unrated:1');s+= "\nassert.equal(shared.confidenceSummary([{key:'a'}],{a:'unsure'}).unsure,1);\nassert.deepEqual(shared.reviewKeys([{key:'a'}],{a:'unsure'}),['a']);\n";p.write_text(s)
subprocess.run(['git','add','study/study-editorial-v1.js','scripts/validate_learning_session.cjs'],cwd=P,check=True)
print('Legacy decoration now leaves stateful control labels intact.')
