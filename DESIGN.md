---
version: alpha
name: "더스티 로즈 · 화장품 소재 에디토리얼"
description: "파스텔 색면, 스튜디오 정물 사진, 큰 연혁 타이포그래피를 사용하는 브랜드 랜딩 페이지 스타일"
omitted:
  - section: motion
    reason: "정지 이미지에서 전환 속도와 효과를 확인할 수 없음"
colors:
  primary: "#DBB8BE"
  secondary: "#F2E3F6"
  surface: "#FFFFFF"
  surface-blush: "#FFF0FA"
  rose-light: "#E9CDDA"
  rose-deep: "#C7A2AA"
  peach: "#F7BFB0"
  sand: "#E3C7C3"
  rose: "#DE9DA5"
  ink: "#2C2027"
typography:
  display:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: -0.045em
  section-title:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.025em
  body:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.35
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 96px
  content-max: 1120px
rounded:
  thumbnail: 12px
  card: 24px
components:
  about-band:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "{spacing.lg}"
  product-gallery:
    backgroundColor: "{colors.surface-blush}"
    padding: "{spacing.xl}"
  product-card:
    rounded: "{rounded.card}"
    typography: "{typography.label}"
    padding: "{spacing.md}"
  video-thumbnail:
    rounded: "{rounded.thumbnail}"
---

# 디자인 스타일 가이드

## Overview

화장품 소재를 다루는 브랜드 페이지다. 위에서부터 화면을 채우는 스튜디오 사진, 회사 연혁, 제품군 순으로 이어진다. 분홍 계열 안에서 색의 온도를 바꾸고, 소품과 원료의 미세한 질감으로 각 구역에 개성을 준다. 정보량이 적은 첫 화면에는 큰 숫자와 짧은 문구를 쓰고, 상세한 설명은 회사 소개 구역에 모은다.

기준 자료는 첨부된 281 × 442px 정지 이미지다. 배경과 카드 색상은 이미지 픽셀에서 채취한 대표값이다. `ink`는 가독성을 고려한 제안값이며, 서체·크기·간격·모서리 수치와 반응형 구성은 화면에서 관찰한 비례를 구현하기 위한 기준값이다.

## Colors

| 역할 | 토큰 | 사용 위치 |
| --- | --- | --- |
| 더스티 로즈 | `primary`, `rose-light`, `rose-deep` | 메인 정물 사진과 배경의 밝은 쪽에서 어두운 쪽까지 이어지는 색조 |
| 화이트 | `surface` | 메인 비주얼과 회사 소개 띠 사이에 밝은 여백을 형성 |
| 페일 라일락 | `secondary` | 회사 소개의 가로 배경 띠와 밝은 바탕의 연도 글자 |
| 블러시 핑크 | `surface-blush` | 제품군을 둘러싸는 넓은 배경 |
| 피치·샌드·로즈 | `peach`, `sand`, `rose` | 제품 카드 3종의 서로 다른 사진 배경 |
| 딥 플럼 | `ink` | 밝은 배경에 놓이는 본문, 기능성 레이블 |

사진 위의 흰색 제목이나 메뉴는 실제 사진의 해당 영역에서 대비를 확인한다. 밝은 소재 위에 글자가 겹치면 위치를 조정하거나 국소적으로 어두운 오버레이를 사용한다.

## Typography

- **큰 숫자와 연도**는 간결한 산세리프로 구성한다. 메인 비주얼의 `40`은 흰색으로 강조하고, 회사 소개의 `Since 1986`은 연보라색으로 배경에 배치한다.
- **소개 제목과 본문**은 어두운 잉크 계열을 사용한다. 제목은 굵게, 본문은 보통 굵기와 넉넉한 줄간격으로 구성해 시선을 구분한다.
- **제품명과 내비게이션**은 짧고 명확하게 쓴다. 카드 제목은 중앙에 놓고, 긴 제품명은 의미 단위로 두 줄에 나눈다.
- 원본 서체는 이미지에서 식별하기 어렵다. 토큰에는 산세리프 인상을 살릴 수 있도록 Inter와 Noto Sans KR을 제안했다.

## Layout

- **메인 비주얼**은 좌우 끝까지 펼친다. 내비게이션은 사진 상단에 얹고, 정물은 하단 중앙에 모은다. 숫자와 기념 문구는 좌측 하단, 작은 영상 썸네일은 우측에 두어 사진과 겹치는 면적을 줄인다.
- **회사 소개**는 폭을 제한한 2열 구성이다. 왼쪽의 세로형 건물 사진은 흰색 여백과 연보라색 띠의 경계를 걸친다. 오른쪽은 연도 글자 아래에 제목과 본문을 배치한다.
- **제품군**은 넓은 블러시 배경 가운데에 같은 크기의 세로 카드 3개를 등간격으로 배치한다. 이미지에서 카드 비율은 폭 대 높이가 약 1:1.6이다.
- **좁은 화면 적용안**은 회사 소개를 사진과 본문 순의 1열로 전환하고, 제품 카드의 제목과 이미지가 읽히는 폭을 기준으로 열 수를 줄인다. 메인 사진을 자를 때 브러시와 스펀지가 함께 보이는 크롭을 우선한다.

## Elevation & Depth

메인 이미지에서는 옆으로 부드럽게 번지는 접지 그림자가 브러시와 스펀지에 입체감을 준다. 회사 소개 사진의 흐린 그림자는 배경 띠 위에 사진이 떠 있는 듯한 인상을 만든다. 제품 갤러리에서는 카드 자체의 테두리보다 원료 사진 속 크림 결, 분말 입자, 안료의 긁힌 표면이 깊이감을 만든다.

## Shapes

건물 사진과 제품 카드는 둥근 직사각형으로 마감한다. 우측 영상 썸네일에도 같은 조형을 작은 반경으로 적용한다. 전체 폭의 배경 구역은 직선 경계를 유지해 사진과 카드의 곡선이 드러나게 한다.

## Voice & Content Strategy

숫자와 연혁 문구는 짧게 제시하고, 브랜드의 이력과 전문성을 설명하는 글은 별도 소개 구역에 둔다. 제품 탐색에서는 카테고리 이름과 원료 질감이 먼저 보이게 한다. 참조 이미지의 메뉴와 회사 소개 본문은 해상도상 정확한 문구를 판독하기 어렵다.

## Components

| 요소 | 구성 |
| --- | --- |
| 사진 위 내비게이션 | 좌측 로고, 중앙의 주 메뉴, 우측 보조 항목. 링크에 충분한 클릭 영역과 키보드 포커스를 제공한다. |
| 기념 문구 | 가벼운 굵기의 큰 숫자 아래 작은 한 줄 설명. 사진 내 소품과 겹치지 않는 영역에 배치한다. |
| 영상 썸네일 | 사진이 들어간 작은 둥근 사각형에 재생 아이콘을 표시한다. 구현 시 영상 재생임을 알 수 있는 접근 가능한 이름을 붙인다. |
| 회사 소개 블록 | 세로형 건물 사진, 큰 연도 글자, 짧은 강조 제목, 본문을 한 구역에 묶는다. |
| 제품 카드 | 위쪽의 카테고리명과 아래쪽의 원료 매크로 사진. 참조에 나타난 제품군은 Inorganic UV Filters, Extender Pigments, Color Pigments다. |

## Do's and Don'ts

- 메인 비주얼에는 넓은 빈 공간과 확산광을 두고, 소품의 색조를 배경과 가까운 계열로 맞춘다.
- 제품 사진은 표면의 질감이 구분될 만큼 가깝게 촬영하거나 크롭한다.
- 연도 글자를 겹쳐 배치할 때 본문과 탐색 요소 주변에 충분한 여백을 둔다.
- 긴 문단과 중요한 정보는 단색 배경 위에 둔다. 사진 위 문구는 짧게 유지한다.
