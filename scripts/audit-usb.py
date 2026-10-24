"""Scan a built USB directory for known secret formats and forbidden private files."""
from pathlib import Path
import json,re,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'usb-submission')
patterns={
 'private_key':rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'github_token':rb'(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{70,})',
 'aws_access_id':rb'AKIA[0-9A-Z]{16}',
 'google_api_key':rb'AIza[0-9A-Za-z_-]{35}',
 'api_secret_key':rb'\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}',
 'slack_token':rb'xox[baprs]-[A-Za-z0-9-]{20,}',
 'credential_url':rb'https?://[^\s/:@"\']+:[^\s/@"\']+@',
}
findings=[];count=0
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 count+=1
 if p.name=='.env' or p.name.startswith('.env.') or p.name in {'.npmrc','.netrc','id_rsa','id_ed25519'} or '.git' in p.relative_to(root).parts:
  findings.append({'file':str(p.relative_to(root)),'type':'forbidden credential/config file'})
 raw=p.read_bytes()
 for kind,pattern in patterns.items():
  if re.search(pattern,raw):findings.append({'file':str(p.relative_to(root)),'type':kind})
print(json.dumps({'scanned_files':count,'known_secret_matches':len(findings),'findings':findings,'note':'Pattern scan plus explicit file allowlist; not a proof against every possible secret format.'},ensure_ascii=False,indent=2))
if findings:sys.exit(1)
