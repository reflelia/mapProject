import proj4 from "proj4";

// TM 좌표계 정의 (예: EPSG:5186, 한국 중부원점 TM 좌표계)
const TM = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs";
const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";

// 좌표 변환
const transformCoord = (x, y) => {
  const [lng, lat] = proj4(TM, WGS84, [x, y]);
  return [lat, lng]; // Leaflet 형식
};

const parseCoord = (coordStr) => {
  const parts = coordStr.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  if (isNaN(x) || isNaN(y)) return null;
  return transformCoord(x, y);
};

export const parsePolygon = (wkt) => {
  const coords = wkt
    .replace(/^POLYGON\s*\(\(/i, "")
    .replace(/\)\)$/i, "")
    .split(",");
  return coords.map(parseCoord).filter((c) => c !== null);
};

export const parseMultiPolygon = (wkt) => {
  const cleaned = wkt
    .replace(/^MULTIPOLYGON\s*\(\(\(/i, "")
    .replace(/\)\)\)$/i, "");
  const polygons = cleaned.split(")),((");
  return polygons.map((poly) =>
    poly.split(",").map(parseCoord).filter((c) => c !== null)
  );
};

export const parseWKT = (wkt) => {
  if (!wkt) return [];
  if (wkt.startsWith("POLYGON")) {
    return [parsePolygon(wkt)];
  } else if (wkt.startsWith("MULTIPOLYGON")) {
    return parseMultiPolygon(wkt);
  }
  return [];
};
