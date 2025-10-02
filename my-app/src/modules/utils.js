// src/utils/csvLoader.js
import Papa from "papaparse";

// 공통 CSV 로더 함수
export const loadCSV = (path) => {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => resolve(result.data),
      error: (err) => reject(err),
    });
  });
};
