// Recorta al centro en proporción de foto carnet (3:4), reduce a 360x480 y comprime a JPEG.
// Queda en ~25–45 KB: cabe de sobra en un documento de Firestore (límite 1 MB).
const PHOTO_WIDTH = 360;
const PHOTO_HEIGHT = 480;
const JPEG_QUALITY = 0.82;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };
    image.src = objectUrl;
  });

export const isImageFile = (file: File) => file.type.startsWith('image/');

export const isFileTooLarge = (file: File) => file.size > MAX_FILE_BYTES;

export const compressPortrait = async (file: File) => {
  const image = await loadImage(file);
  const targetRatio = PHOTO_WIDTH / PHOTO_HEIGHT;
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const cropWidth = sourceRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
  const cropHeight = sourceRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
  const cropX = (image.naturalWidth - cropWidth) / 2;
  const cropY = (image.naturalHeight - cropHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_WIDTH;
  canvas.height = PHOTO_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('El navegador no permite procesar imágenes.');
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};
