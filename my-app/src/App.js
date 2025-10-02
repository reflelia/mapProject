import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, Polyline } from "react-leaflet";
import SearchBox from "./modules/searchbox";
import ZoomMarkers from "./modules/ZoomMarkers";
import ChatWidget from "./modules/ChatWidget";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {loadCSV} from './modules/utils';
import "leaflet-polylinedecorator"
import {getRoute} from './modules/getRoute'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 기본 마커 아이콘
const markerIcon_ = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 초기 중심 위치
const position = [36.17, 127.83];
// 지도 경계
const bounds = L.latLngBounds([32.5, 123.5], [39.0, 132.0]);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 거리 (km)
}

// 원을 그리는 컴포넌트
// function LocationCircle({ myPos }) {
//   const map = useMap();
//   const [showCircle, setShowCircle] = useState(false);
//   const radius = 1000;

//   useEffect(() => {
//     if (myPos) {
//       // flyTo 실행
//       // map.flyTo(myPos, 15, { duration: 1.5 });

//       // 이동 완료 후 원 보여주기
//       const handleMoveEnd = () => {
//         setShowCircle(true);
//         map.off("moveend", handleMoveEnd); // 이벤트 중복 제거
//       };

//       map.on("moveend", handleMoveEnd);
//     }
//   }, [myPos, map]);

//   // useMapEvents({
//   //   click(e){
//   //     const dist = getDistanceFromLatLonInKm(myPos[0], myPos[1], e.latlng.lat, e.latlng.lng)
//   //     if (dist > radius/1000){
//   //       setShowCircle(false);
//   //     }
//   //   }
//   // })

//   if (!showCircle) return null;

//   return (
//     <Circle
//       center={myPos}
//       radius={radius} // 반경 1km
//       pathOptions={{
//         color: "blue",
//         fillColor: "blue",
//         fillOpacity: 0.1,
//       }}
//     />
//   );
// }


// 지도 이동만 담당
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [map, position]);
  return null;
}

function getDayType() {
  const today = new Date();
  const day = today.getDay(); 
  // 0: 일요일, 1: 월요일, ..., 5: 금요일, 6: 토요일

  if (day === 6) return "토요일";
  if (day >= 1 && day <= 5) return "평일"; 
  if (day === 0) return "일요일"; // 필요하면 추가
}

// 내 위치 버튼
function LocateButton({ onLocation, getRoad, setMyPos, savedPos }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
    }
  }, []);

  const handleClick = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const latlng = [37.54135, 127.165254];
          onLocation(latlng);
          map.flyTo(latlng, 15);
          setMyPos(latlng)
          if (savedPos){
            getRoad(
              {lat:latlng[0], lng:latlng[1]},
              savedPos
            )
          }
        },
        (err) => {
          console.error("위치 가져오기 실패:", err);
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    }
  };

  return (
    <div ref={ref}>
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        padding: "8px 12px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      📍 내 위치
    </button>
    </div>
  );
}

function ClickMyPos( {onLocation }) {
  useMapEvents({
    click(e) {
      onLocation([e.latlng.lat, e.latlng.lng])
    },
  });
  return null;
}

function App() {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  function DestinationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setDest([lat, lng]);
        if (myPos) {
          handleRoute(
            { lat: myPos[0], lng: myPos[1] },
            { lat, lng }
          );
        }
      },
    });
    return dest ? <Marker position={dest} /> : null;
  }

  const [markers, setMarkers] = useState([]);
  const [myPos, setMyPos] = useState(null);
  const [open, setOpen] = useState(false);
  const [subwayData, setSubwayData] = useState([]);
  const [selectedTime, setSelectedTime] = useState(getCurrentTime);
  const [selectedDay, setSelectedDay] = useState(getDayType);
  const [targetStation, setTargetStation] = useState(null);
  const [dest, setDest] = useState(null);   // 목적지

  const [route, setRoute] = useState([]); // 경로 좌표 배열
  const [info, setInfo] = useState(null); // 거리/시간 정보
  const [savedPos, setSavedPos] = useState(null);
  const [botMessage, setBotMessage] = useState(null); // 봇 메시지

  const myPosRef = useRef(myPos);

  useEffect(() => {
    myPosRef.current = myPos; // myPos 바뀔 때마다 ref 업데이트
  }, [myPos]);

  const handleSubwayPos = async (pos) => {
    const currentPos = myPosRef.current; // 항상 최신값
    const result = await getRoute({lat:currentPos[0], lng:currentPos[1]}, pos)
    setSavedPos(pos)
    if (result) {
      setRoute(result.coords);
      setInfo(result.info);
      console.log(result.info.distance,'km,', result.info.duration, '분')
      const res = await fetch(
        `http://localhost:5000/info?distance=${result.info.distance}&time=${result.info.duration}`
      );
      const data = await res.json();
      setBotMessage(data.reply)
    }
  }

  const handleRoute = async (start, end) => {
    const result = await getRoute(start, end);
    setSavedPos(end)
    if (result) {
      setRoute(result.coords);
      setInfo(result.info);
      console.log(result.info.distance,'km,', result.info.duration, '분')
      const res = await fetch(
        `http://localhost:5000/info?distance=${result.info.distance}&time=${result.info.duration}`
      );
      const data = await res.json();
      setBotMessage(data.reply)
    }
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"; // 스크롤 비활성화
    }
  }, [open])

  useEffect(() => {
    if (myPos && markers.length > 0) {
      const nearby = markers.filter((m) => {
        const dist = getDistanceFromLatLonInKm(myPos[0], myPos[1], m.lat, m.lng);
        return dist <= 1; // ✅ 5km 이내
      });

      console.log("📍 내 위치 기준 2km 이내 지하철역:");
      nearby.forEach((station) => {
        const dist = getDistanceFromLatLonInKm(myPos[0], myPos[1], station.lat, station.lng);
        console.log(`${station.name} (${station.ho}호선) - ${dist.toFixed(2)} km`);
      });
    }
  }, [myPos, markers]);

  useEffect(() => {
    // locations.csv 불러오기
    loadCSV("/locations.csv").then((data) => {
      const parsed = data
        .map((row) => ({
          name: row.name,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          ho: row.ho,
        }))
        .filter((row) => !isNaN(row.lat) && !isNaN(row.lng));
      setMarkers(parsed);
    });

    // time.csv 불러오기
    loadCSV("/time.csv").then((data) => {
      setSubwayData(data);
    });
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMyPos([latitude, longitude]);
        },
        (err) => {
          console.error("위치 가져오기 실패:", err);
        }
      );
    }
  }, []);

  // useEffect(() => {
  //   selectedTime
  // })

  const toggleSidebar = () => {setOpen(!open)};
  const getcurt = () => {
    setSelectedTime(getCurrentTime());
    setSelectedDay(getDayType())
  };

  return (
    <div>
      {/* 사이드바 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: open ? 0 : "-282px",
          width: "250px",
          height: "100%",
          background: "#f4f4f4",
          boxShadow: "2px 0 5px rgba(0,0,0,0.3)",
          transition: "left 0.3s ease-in-out",
          padding: "1rem",
          zIndex: 1000,
        }}
      >
          <h3>⏰ 시간 선택</h3>
          <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", padding:"0px" }}>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={{ width: "100%", padding: "6px", marginTop: "10px" }}
          >
            <option value="평일">평일</option>
            <option value="토요일">토요일</option>
            <option value="일요일">일요일</option>
          </select>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{ width: "100%", padding: "6px", marginTop: "10px", boxSizing: "border-box" }}
          />
          <button
            onClick={getcurt}
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            O
          </button>
          </div>
        <h3>🔍 역 검색</h3>
        <SearchBox markers={markers} onSelect={setTargetStation} />
      </div>

      <ChatWidget botMessage={botMessage}/>

      {/* 사이드바 토글 버튼 */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: open ? "282px" : "0px",
          zIndex: 1100,
          padding: "20px 12px",
          background: "#474747ff",
          color: "#ffffffff",
          border: '1px solid black',
          borderRadius: "4px",
          cursor: "pointer",
          transition: "left 0.3s ease-in-out",
          fontSize: "20px",
        }}
      >
        {open ? "<" : ">"}
      </button>

      {/* 지도 */}
      <MapContainer
        center={position}
        zoom={8.0}
        zoomSnap={0.5}
        zoomControl={false}
        attributionControl={false}
        // maxBounds={bounds}
        // maxBoundsViscosity={1.0}
        style={{ width: "100vw", height: "100vh" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" maxZoom={20} minZoom={8.0} />


        {/* <ClickMyPos onLocation={setMyPos}/> */}
        {targetStation && <FlyToLocation position={targetStation} />}
        {myPos && <FlyToLocation position={myPos} />}

        <LocateButton onLocation={setMyPos} getRoad={handleRoute} setMyPos={setMyPos} savedPos={savedPos} />

        {myPos && <Marker position={myPos} icon={markerIcon_} />}
         <DestinationMarker /> 
        {route.length > 0 && (
            <>
              <Polyline
                positions={route}
                pathOptions={{ color: "blue", weight: 6, opacity: 0.5 }}
              />
            </>
          )}


        {myPos && <ZoomMarkers
          markers={markers}
          subwayData={subwayData}
          selectedDay={selectedDay}
          selectedTime={selectedTime}
          minZoom={13}
          onMarkerClick={handleSubwayPos}
        />}
      </MapContainer>
    </div>
  );
}

export default App;
