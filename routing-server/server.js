import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 5000;

// 경로 거리 및 시간 수신 프록시
app.get("/info", async (req, res) => {
  const {distance, time} = req.query;
  console.log(distance, time)
  // 언어 모델 입력 결과 수신 후 적용
  res.json({reply: `거리: ${distance}km, 시간: ${time}분` });
})

// ORS 경로 API 프록시
app.get("/route", async (req, res) => {
  const { start, end, mode } = req.query;
  try {
    // console.log('api 정보', start, end, mode)
    const orsRes = await fetch(
      `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${process.env.ORS_KEY}&start=${start}&end=${end}`
    );
    const data = await orsRes.json();

    // ✅ JSON 저장 (타임스탬프 기반 파일명)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(__dirname, `routes/route_${timestamp}.json`);

    // routes 폴더 없으면 생성
    if (!fs.existsSync(path.join(__dirname, "routes"))) {
      fs.mkdirSync(path.join(__dirname, "routes"));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    // console.log(`✅ Saved route JSON: ${filePath}`);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
