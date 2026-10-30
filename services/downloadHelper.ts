/**
 * Universal robust image downloader that works across browsers and iframe sandboxes
 */
export const downloadImageFile = async (url: string, filename: string): Promise<boolean> => {
  if (!url) return false;

  const safeFilename = filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.webp')
    ? filename 
    : `${filename}.png`;

  try {
    let blob: Blob;

    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const b64Data = parts[1] || '';
      const byteCharacters = atob(b64Data);
      const byteArrays: Uint8Array[] = [];

      const sliceSize = 1024;
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      blob = new Blob(byteArrays, { type: mimeType });
    } else if (url.startsWith('blob:')) {
      const response = await fetch(url);
      blob = await response.blob();
    } else {
      // Remote URL
      try {
        const response = await fetch(url, { mode: 'cors' });
        blob = await response.blob();
      } catch (fetchErr) {
        // If CORS fetch fails, try drawing on an offscreen canvas
        blob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context unavailable'));
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error('Canvas toBlob failed'));
            }, 'image/png');
          };
          img.onerror = (e) => reject(e);
          img.src = url;
        });
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.setAttribute('download', safeFilename);
    link.download = safeFilename;

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (error) {
    console.warn('downloadImageFile blob strategy failed, falling back to direct anchor:', error);
    try {
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = safeFilename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
      return true;
    } catch (e2) {
      console.error('All download strategies failed:', e2);
      return false;
    }
  }
};
