/**
 * Фотогалерея марафона.
 * Как добавить снимок: положите файл в `public/content/gallery/` (webp или jpg),
 * затем: `import { assetUrl } from './baseUrl'` и в массиве `src: assetUrl('content/gallery/…')`.
 */
export type GalleryItem = {
  /** URL изображения (файл в public/content/gallery/) */
  src: string;
  /** Краткое описание для alt и подписи */
  alt: string;
  /** Необязательная подпись под снимком в сетке */
  caption?: string;
};

/** Порядок в массиве = порядок на странице (слева направо, сверху вниз). */
export const galleryItems: GalleryItem[] = [
  // Пример после появления фото:
  // { src: assetUrl('content/gallery/marathon-2026-01.webp'), alt: '…', caption: '…' }, // + import assetUrl
];
