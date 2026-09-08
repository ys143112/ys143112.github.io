# FORM → CODE

3D 디자이너의 개발·AI 학습 기록을 위한 한국어 블로그입니다. Pages CMS에서 글을 저장하면 GitHub Actions가 검사·이미지 최적화·사이트 생성·GitHub Pages 게시를 수행합니다.

## 시작하기

Node.js 22.12 이상이 필요합니다. Node.js 22 LTS를 권장합니다.

```sh
npm ci
npm run dev
```

브라우저에서 개발 서버가 출력한 주소를 엽니다.

```sh
npm test
npm run check
npm run build
```

## GitHub에 연결

블로그 저장소는 `ys143112/form-to-code`, 기본 주소는 `https://ys143112.github.io/form-to-code/`입니다. 기존에 같은 이름의 저장소가 있다면 덮어쓰지 말고 다른 새 저장소 이름을 선택하세요.

1. GitHub에서 공개 저장소를 만듭니다. GitHub Pages의 무료 구성은 공개 저장소 기준입니다.
2. 이 프로젝트 전체를 올립니다. `.github`, `.pages.yml` 같은 숨김 파일과 `package-lock.json`도 포함합니다. `node_modules`, `dist`, `.env`는 올리지 않습니다.
3. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
4. **Actions → Publish blog → Run workflow**를 실행하거나 `main` 브랜치에 변경사항을 저장합니다.
5. 성공하면 작업 결과의 `github-pages` 배포 주소에서 블로그를 확인합니다.

GitHub CLI가 있다면 `scripts/connect-github.ps1`로 저장소 생성, 업로드, Pages 설정을 진행할 수 있습니다. 이 스크립트는 기존 원격 저장소를 덮어쓰지 않습니다.

```powershell
pwsh -File scripts/connect-github.ps1
```

`pwsh`가 없으면 `powershell -File scripts/connect-github.ps1`을 사용합니다.

프로젝트 저장소(`아이디.github.io/저장소명/`)도 지원합니다. 배포 작업이 실제 Pages 주소와 하위 경로를 자동 전달하며, 본문 이미지와 링크에도 해당 경로를 적용합니다.

## 글쓰기 편집기 연결

1. https://app.pagescms.org 에서 **Sign in with GitHub**를 선택합니다.
2. Pages CMS GitHub App을 설치할 때 이 블로그 저장소를 선택합니다.
3. 저장소, `main` 브랜치, **게시글** 메뉴를 엽니다.
4. 새 글을 작성하고 **블로그에 공개**를 켠 다음 저장합니다.
5. GitHub Actions의 **Publish blog** 성공 여부를 확인합니다.

원고와 이미지는 GitHub에 저장됩니다. 매번 Git 명령이나 배포 명령을 입력할 필요는 없습니다. CMS 저장부터 실서비스 반영까지는 최초 연결 후 실제 저장 동작으로 한 번 확인하세요.

## 작성 규칙

- 제목, 본문, 작성일, 카테고리를 입력합니다. 날짜와 기본 카테고리는 편집기가 채웁니다.
- 고유 ID는 자동 생성되며 URL에 사용됩니다. 제목을 고쳐도 주소는 유지됩니다.
- 소개문을 비우면 본문에서 짧은 요약을 추출합니다. 이는 규칙 기반 처리이며 외부 AI API를 호출하지 않습니다.
- 대표 이미지는 미디어 보관함에서 선택하고 이미지 설명을 작성합니다.
- 본문 이미지도 미디어 보관함을 통해 넣으면 빌드 중 반응형 WebP 이미지가 생성됩니다. 움직이는 GIF는 원본으로 제공합니다.
- 본문의 코드 블록은 강조 표시와 복사 버튼을 지원합니다. 언어 지정은 Source 모드에서 ` ```javascript `처럼 코드펜스에 적습니다.
- **홈에 크게 소개**를 켠 글 중 가장 최근 글을 홈 대표로 사용합니다. 선택한 글이 없으면 최신 글을 사용합니다.
- 대표 이미지가 없는 글에는 제목·카테고리 기반 SVG 표지를 생성합니다. 소셜 공유 이미지에는 실제 대표 이미지를 사용합니다.
- 공유 제목·설명, RSS, 사이트맵, 검색용 내용은 공개 글만 반영합니다.
- 초기 글은 **샘플**로 표시했습니다. 본인의 글로 바꾸고 **샘플 글 표시**를 끄거나 샘플을 비공개로 전환하세요.

## 초안, 수정, 공개 해제

`published: false`인 글은 사이트의 상세 경로, 목록, RSS, 사이트맵, 검색에서 제외됩니다. 공개 상태를 끄고 저장하면 다음 성공한 배포에서 사이트에서 내려갑니다.

**공개 GitHub 저장소에서는 초안 파일과 과거 수정 이력도 공개됩니다.** 사이트의 숨김 기능은 원고의 비밀 보관 기능이 아닙니다. 민감한 초안은 로컬 등 비공개 위치에 보관하세요.

동일 ID의 원고를 수정하면 동일 주소의 글을 갱신합니다. 같은 작업을 다시 실행해도 글이 중복 생성되지 않습니다. 날짜는 표시·정렬용이며 예약 발행 기능은 제공하지 않습니다.

## 게시 실패 시

제목·ID·날짜·이미지 경로·공개 본문을 검사하고, 타입 검사 및 정적 출력의 링크 검사까지 통과해야 배포합니다. 실패 시 기존 성공 배포를 유지합니다.

1. 저장소 **Actions**에서 실패한 **Publish blog**를 엽니다.
2. 빨간색 단계의 오류 문구를 확인합니다. 파일명과 빠진 필드를 표시합니다.
3. CMS에서 내용을 수정하고 다시 저장합니다.
4. 일시적인 통신 오류라면 **Re-run failed jobs**로 같은 작업을 다시 실행합니다.

## 디자인과 설정

`src/data/site.json`은 **블로그 소개 설정** 메뉴에서 수정할 수 있습니다. 전반적인 색상과 간격은 `src/styles/global.css`에 정의되어 있습니다.

홈, 기록 목록, 카테고리, 프로젝트 목록, 글 상세, 소개, 글쓰기 안내, 404 화면을 포함합니다. 검색은 현재 목록의 제목·본문·태그를 브라우저에서 필터링합니다.

## 구조

```text
.pages.yml                      편집기 구성
.github/workflows/deploy.yml     자동 발행
.github/workflows/check.yml      변경사항 검사
src/content/posts/              Markdown 원고
src/data/site.json              블로그 소개와 주소
src/layouts/                    공통 화면
src/pages/                      각 페이지 및 RSS·표지 생성
public/uploads/                 원본 이미지
scripts/                        원고 검사·이미지 최적화·출력 검증
tests/                          발행 규칙 테스트
```

`public/_media`와 `src/data/media.generated.json`은 빌드 때 생성되며 Git에 보관하지 않습니다. `.openai/hosting.json`은 작업 확인용 Sites 배포 정보이며 GitHub Pages 자동 발행에 필요하지 않습니다.

## 운영 범위

무료 공개 저장소와 표준 GitHub Actions 실행, GitHub Pages, Pages CMS 온라인 서비스를 사용하는 구성입니다. 각 서비스의 사용 한도는 적용됩니다. 개인 도메인과 외부 AI API는 기본 구성에 포함하지 않습니다.

AI 교정·생성 요약·자동 태그·Notion 동기화·예약 발행·실시간 3D 뷰어는 추후 확장 항목입니다. 기본 자동 발행은 외부 AI 서비스 없이 작동합니다.

브랜드 리본 이미지는 이 블로그를 위해 생성한 AI 아트이며 사용자가 제작한 3D 작품으로 표시하지 않았습니다.
