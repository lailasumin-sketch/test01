"""Package the complete four-category prototype for offline USB use."""
from pathlib import Path
import csv
import io
import json
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
archive = root / 'downloads/uiseong-life-full-usb.zip'
archive.parent.mkdir(exist_ok=True)
records = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e',
     "import {records} from './src/data.js'; process.stdout.write(JSON.stringify(records));"],
    cwd=root, text=True))
assert len(records) == 432
assert {r['category'] for r in records} == {'home', 'farm', 'support', 'job'}
html = (root / 'index.html').read_text()
assert '어떤 의성 생활을 원하세요?' in html
assert 'CHECK YOUR DATA' not in html and 'type="file"' not in html

instructions = '''의성에서, 살다 — 전체 서비스 USB 패키지

[바로 실행]
1. ZIP 파일을 ‘모두 압축 풀기’로 해제합니다.
2. uiseong-life-full 폴더 전체를 USB에 복사합니다.
3. 폴더 맨 위의 index.html을 더블클릭합니다.
4. Chrome, Edge, Firefox, Safari 등 최신 브라우저에서 사용합니다.
설치, CMD, 서버 실행, 인터넷 연결은 필요하지 않습니다.
공식 사이트로 이동할 때만 인터넷이 필요합니다.

[포함된 전체 기능]
- 의성군 18개 읍·면 선택
- 주거 / 농산물 / 지원 정보 / 취업 전체 분야
- 분야별 108건, 총 432건 가상데이터
- 희망 생활 문장 입력과 조건 확인·수정
- 월세·보증금 상한, 작목, 지원 대상, 근무 형태, 시급 하한
- 키워드 검색, 분야별 필터, 관심 정보, 결과 상세보기, 더 보기
- 모바일 화면과 키보드 이용
파일 확인·CSV 불러오기 영역은 없습니다.

[빠른 확인]
1. 전체 결과: 432건 (각 분야 108건)
2. 안계면 선택: 24건 (각 분야 6건)
3. 농산물 분야 + 마늘 검색: 전체 지역 18건
4. 맞춤 입력 예시:
   안계면에서 월세 50만 원 이하 집, 초보 교육과 주말 일자리를 찾고 싶어요.
   → ‘문장에서 조건 가져오기’ → 가져온 항목 확인 → ‘내 조건으로 검색하기’
5. 하트 버튼은 현재 브라우저에 관심 정보를 저장합니다.

[데이터와 파일]
- 실행에 필요한 화면·스타일·동작·데이터는 index.html 안에 모두 포함되어 있습니다.
- 다른 PC의 폴더 경로나 외부 서버를 찾아가지 않습니다.
- data 폴더의 JSON·CSV는 전체 가상데이터 432건을 별도로 보관한 사본입니다.
- data 폴더 파일을 편집해도 이미 만들어진 index.html은 자동으로 바뀌지 않습니다.
- 수정하려면 source/src/data.js 등 원본을 수정하고 source 폴더에서 빌드합니다.
- 관심 정보 유지 여부는 브라우저의 로컬 파일 저장소 정책에 따라 달라집니다.

[범위]
문장 입력은 정해진 표현을 인식하는 규칙 기반 기능입니다.
인식된 조건을 확인한 뒤 검색하세요. 외부 AI 호출이나 실시간 수집은 없습니다.
모든 주거·작목·지원·취업 데이터와 금액·지역 배치는 시연용 가상데이터입니다.
실제 매물·운영 중인 지원사업·채용 공고·지역별 작목 통계가 아닙니다.
지도·회원가입·서버 데이터베이스는 구현되어 있지 않습니다.
'''
data_help = '''전체 서비스 가상데이터 설명

records.json: 프로그램이 사용하는 전체 가상자료 432건의 JSON 사본
records.csv: 같은 자료를 엑셀에서 확인할 수 있는 UTF-8 BOM CSV 사본

area: 읍·면
category: home=주거, farm=농산물, support=지원 정보, job=취업
rent: 월세(만 원/월)
deposit: 보증금(만 원)
size: 면적(㎡)
pay: 시급(원)
features: 특징 목록 (CSV에서는 |로 구분)
source_name, source_url: 관련 공식 사이트의 명칭·첫 화면 주소
sample: true=가상데이터

해당 분야에 없는 값은 CSV에서 빈칸입니다.
모든 수치와 내용은 가상이며 실제 시세·모집·지원 자격을 의미하지 않습니다.
이 사본은 보관·검토용입니다. 실행 화면은 index.html에 포함된 데이터를 사용합니다.
'''
source_help = '''# 전체 서비스 원본 코드

이 폴더는 주거·농산물·지원·취업 전체 서비스의 재빌드 가능한 원본입니다.

일반 이용자는 상위 폴더의 index.html을 더블클릭하면 됩니다.
개발자가 수정할 때만 Node.js 18 이상을 사용해 이 폴더에서 실행하세요.

```sh
npm run build
npm test
```

외부 npm 패키지 설치는 필요 없습니다.
`npm run build`는 이 source 폴더 안의 index.html을 재생성합니다.
USB 메인 실행 파일에도 반영하려면 재생성된 index.html을 상위 폴더로 복사하세요.

- src/page.html: 화면 구조
- src/style.css: 디자인
- src/app.js: 사용자 입력과 화면 동작
- src/data.js: 가상데이터·검색·문장 조건 추출
- scripts/build.mjs: 외부 의존성 없는 단일 HTML 생성
- tests/search.test.js: 검색·금액·문장 조건 테스트

모든 자료는 예시이며, 문장 입력은 규칙 기반입니다.
'''
fields = ['id','area','category','title','tag','description','rent','deposit','size',
          'crop','level','method','season','target','kind','schedule','pay',
          'features','source_name','source_url','sample']
buffer = io.StringIO(newline='')
writer = csv.DictWriter(buffer, fieldnames=fields)
writer.writeheader()
for record in records:
    row = {key: record.get(key, '') for key in fields}
    row['features'] = ' | '.join(record['features'])
    row['source_name'] = record['source']['name']
    row['source_url'] = record['source']['url']
    writer.writerow(row)
package = json.loads((root / 'package.json').read_text())
package['scripts'] = {key: package['scripts'][key] for key in ['start','build','test']}
package['scripts']['test']='node --test tests/search.test.js'
base = 'uiseong-life-full/'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr(base + 'index.html', html)
    z.writestr(base + '먼저읽기_실행방법.txt', instructions)
    z.writestr(base + 'data/데이터설명.txt', data_help)
    z.writestr(base + 'data/records.json', json.dumps(records, ensure_ascii=False, indent=2))
    z.writestr(base + 'data/records.csv', buffer.getvalue().encode('utf-8-sig'))
    z.writestr(base + 'source/README.md', source_help)
    z.writestr(base + 'source/package.json', json.dumps(package, ensure_ascii=False, indent=2))
    for file in ['index.html','src/page.html','src/style.css','src/app.js','src/data.js',
                 'scripts/build.mjs','tests/search.test.js','vercel.json','.gitignore']:
        z.write(root / file, base + 'source/' + file)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert z.read(base + 'index.html') == (root / 'index.html').read_bytes()
    assert len(json.loads(z.read(base + 'data/records.json'))) == 432
    csv_rows = list(csv.DictReader(io.StringIO(z.read(base + 'data/records.csv').decode('utf-8-sig'))))
    assert len(csv_rows) == 432
    assert {row['category'] for row in csv_rows} == {'home','farm','support','job'}
print(f'Complete USB archive verified: {archive} ({archive.stat().st_size:,} bytes)')
