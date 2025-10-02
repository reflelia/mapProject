export async function getRoute(start, end) {
console.log(start, end)
  const res = await fetch(
    `http://localhost:5000/route?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&mode=foot-walking`
  );
  const data = await res.json();
  if (typeof data.error === "undefined") {
    const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
    const info = {
      distance: (data.features[0].properties.summary.distance / 1000).toFixed(2), // km
      duration: (data.features[0].properties.summary.duration / 60).toFixed(0),  // min
    };
    return { coords, info };
  } else {
    alert('길 찾기 실패')
    console.log("길 찾기 실패");
    return null;
  }
}