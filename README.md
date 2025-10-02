## LLM 기반 지하철역까지 걷기 난이도 측정

### 구현된 기능들
1. 지하철 역 위치 및 현재 요일 및 시각에 따른 지하철 혼잡도 표기
2. 현재 내 위치 추적
3. 맵이나 지하철 역 마커 클릭 시 현재 내 위치에서 도보 경로 추출: 거리 및 시간 계산
4. 계산된 거리 및 시간을 우측 하단 채팅방에 출력

### OpenRouteService api 키 할당 방법
1. 사이트 접속 후 회원가입 및 api 키 생성 [https://openrouteservice.org/]
2. routing-server 내부에 .env 파일 생성 후 api 키 입력 (example.env 참조)
