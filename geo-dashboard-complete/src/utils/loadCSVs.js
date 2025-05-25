import Papa from 'papaparse';

export function loadCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => reject(err),
    });
  });
}
