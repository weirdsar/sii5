import type { ImageMetadata } from 'astro';

import gidravlika64 from '../assets/images/cases/gidravlika64-preview.png';
import razumnyeokna from '../assets/images/cases/razumnyeokna-preview.gif';
import uzelok64 from '../assets/images/cases/uzelok64-preview.gif';
import volgawhisper from '../assets/images/cases/volgawhisper-preview.gif';
import placeholder from '../assets/images/placeholder.svg';

/** Превью кейса по slug — для `<Image src={...} />` из `astro:assets`. */
export const casePreviewBySlug: Record<string, ImageMetadata> = {
  uzelok64,
  gidravlika64,
  volgawhisper,
  razumnyeokna,
};

export function getCasePreview(slug: string): ImageMetadata | undefined {
  return casePreviewBySlug[slug];
}

export { placeholder };
