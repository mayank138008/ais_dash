export async function getImageStatsFromOverlay(url) {
    try {
      // Fetch the image and convert it to Blob
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
  
      // Convert Blob to Image
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
  
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl); // cleanup
  
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
  
            let pixelValues = [];
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const alpha = data[i + 3];
  
              if (alpha > 0) {
                const grayscale = (r + g + b) / 3;
                pixelValues.push(grayscale);
              }
            }
  
            if (pixelValues.length === 0) {
              resolve(null);
              return;
            }
  
            const mean = pixelValues.reduce((a, b) => a + b, 0) / pixelValues.length;
            const min = Math.min(...pixelValues);
            const max = Math.max(...pixelValues);
  
            resolve({
              mean: Number(mean.toFixed(2)),
              min: Number(min.toFixed(2)),
              max: Number(max.toFixed(2)),
            });
          } catch (e) {
            reject(e);
          }
        };
  
        img.onerror = reject;
        img.src = objectUrl;
      });
    } catch (e) {
      console.error('❌ Could not load overlay image stats:', e);
      return null;
    }
  }
  