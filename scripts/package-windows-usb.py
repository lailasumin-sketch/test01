"""Build and package the complete Windows USB application. No external Go modules."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import zipfile

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser()
parser.add_argument('--go',required=True,help='Path to the official Go compiler (1.24+)')
args=parser.parse_args()
go=str(Path(args.go).resolve())
output=ROOT/'usb-submission'
output.mkdir(exist_ok=True)
env=dict(os.environ,GOCACHE=str(Path(tempfile.gettempdir())/'uiseong-go-cache'),GOPATH=str(Path(tempfile.gettempdir())/'uiseong-go-path'),GOTOOLCHAIN='local',CGO_ENABLED='0',GOMAXPROCS='2',GOPROXY='off')
subprocess.run(['node','usb/build-usb.mjs'],cwd=ROOT,check=True)
runtime=output/'runtime';runtime.mkdir(exist_ok=True)
for arch in ['amd64','arm64','386']:
    subprocess.run([go,'build','-p','2','-trimpath','-buildvcs=false','-ldflags=-s -w -buildid=','-o',str(runtime/f'server-windows-{arch}.exe'),'.'],cwd=ROOT/'usb/server',env=dict(env,GOOS='windows',GOARCH=arch),check=True)
    print('Built Windows',arch,flush=True)
goroot=Path(subprocess.check_output([go,'env','GOROOT'],env=env,text=True).strip())
shutil.copyfile(goroot/'LICENSE',runtime/'LICENSE-Go.txt')
launcher=(ROOT/'usb/launcher.bat').read_text().replace('\r\n','\n').replace('\n','\r\n')
(output/'실행하기.bat').write_bytes(launcher.encode('utf-8'))
for source,destination in [('실행안내서.txt','심사위원용_실행안내서.txt'),('구조분석.md','구조분석.md'),('검증결과.md','검증결과.md')]:
    shutil.copyfile(ROOT/'usb'/source,output/destination)
source=output/'source'
if source.exists():shutil.rmtree(source)
source.mkdir()
files=['.gitignore','vercel.json','README.md','src/page.html','src/style.css','src/data.js','src/app.js','scripts/build.mjs','scripts/package-windows-usb.py','scripts/audit-usb.py','tests/search.test.js','tests/usb.test.js','usb/build-usb.mjs','usb/csv.mjs','usb/launcher.bat']
# Explicit allowlist: no Git metadata, environment files, build caches or credentials.
files=files+['usb/실행안내서.txt','usb/구조분석.md','usb/검증결과.md','usb/server/main.go','usb/server/go.mod']
for name in files:
    target=source/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/name,target)
package=json.loads((ROOT/'package.json').read_text())
package['scripts']={key:package['scripts'][key] for key in ['start','build','test','build:usb']}
package['scripts']['test']='node --test tests/search.test.js tests/usb.test.js'
(source/'package.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n')
info={'application':'Uiseong Life Windows USB','go':subprocess.check_output([go,'version'],env=env,text=True).strip(),'windows_architectures':['amd64','arm64','386'],'records':432,'server_bind':'127.0.0.1','preferred_port':18765,'node_required_on_judge_pc':False,'internet_required_for_core':False,'windows_native_validation':'pending real Windows PC'}
(output/'BUILD-INFO.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
manifest=[]
for p in sorted(output.rglob('*')):
    if p.is_file() and p.name!='SHA256SUMS.txt':manifest.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(output).as_posix())
(output/'SHA256SUMS.txt').write_text('\n'.join(manifest)+'\n')
archive=ROOT/'downloads/uiseong-life-windows-usb.zip'
archive.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(output.rglob('*')):
        if p.is_file():z.write(p,'uiseong-life-windows-usb/'+p.relative_to(output).as_posix())
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print('Windows USB folder:',output)
print('ZIP:',archive,'bytes:',archive.stat().st_size)
