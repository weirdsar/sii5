/**
 * Сборка **`public/igra.pdf`** (прямая ссылка на сайте: **`/igra.pdf`**) и копия в **`docs/igra.pdf`**.
 * **19 страниц**: 18 листов с рассадкой (игры 1…18) + 1 чистый бланк шаблона в конце.
 * База: `docs/Protokol_igry_odnostoronii_774_novyi_774.pdf` (страница шаблона копируется для каждого листа).
 *
 * Все координаты и типографика — **`src/protocolPdfMaster.ts`** (мастер).
 * Скрипт не читает `docs/protokol.MD`. Меняются только данные пар / рассадки (та же матрица, что на сайте).
 * Формат колонки «Игрок»: **`PLAYER_COLUMN`** + **`docs/LINEUP.md`**.
 *
 * Принцип матрицы: см. `docs/LINEUP.md`.
 */

import fontkit from '@pdf-lib/fontkit';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { buildRandomizedSeatsGrid, LINEUP_RANDOM_SEED } from '../src/lineupGridCore.ts';
import { LINEUP_PDF_TEAMS } from '../src/lineupPdfTeams.ts';
import {
  DATE_FIELD,
  GAME_NO_FIELD,
  HEADER_BODY_RGB,
  HEADER_TEXT,
  PLAYER_COLUMN,
  PROTOCOL_PDF_BLANK_TAIL_SHEETS,
  PROTOCOL_PDF_GAME_COUNT,
  TABLE_NO_FIELD,
  TOURNAMENT_FIELD,
} from '../src/protocolPdfMaster.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPathPublic = join(root, 'public', 'igra.pdf');
const outPathDocs = join(root, 'docs', 'igra.pdf');
const templatePath = join(root, 'docs', 'Protokol_igry_odnostoronii_774_novyi_774.pdf');

async function loadBodyFont(pdf: PDFDocument): Promise<Awaited<ReturnType<PDFDocument['embedFont']>>> {
  pdf.registerFontkit(fontkit);
  const fontPath = join(root, 'node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf');
  const bytes = await readFile(fontPath);
  return pdf.embedFont(bytes, { subset: true });
}

function splitLongToken(token: string, size: number, maxWidth: number, font: PDFFont): string[] {
  if (font.widthOfTextAtSize(token, size) <= maxWidth) return [token];
  const parts: string[] = [];
  let cur = '';
  for (const ch of token) {
    const nxt = cur + ch;
    if (cur && font.widthOfTextAtSize(nxt, size) > maxWidth) {
      parts.push(cur);
      cur = ch;
    } else {
      cur = nxt;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

function wrapByWidth(text: string, size: number, maxWidth: number, font: PDFFont): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const w of words) {
    tokens.push(...splitLongToken(w, size, maxWidth, font));
  }
  const lines: string[] = [];
  let cur = '';
  for (const token of tokens) {
    const next = cur ? `${cur} ${token}` : token;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = token;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

function fitText(
  text: string,
  font: PDFFont,
  opts: {
    maxWidth: number;
    maxHeight: number;
    minSize: number;
    maxSize: number;
    maxLines: number;
    lineHeightMult?: number;
  },
): { size: number; lines: string[]; lineHeight: number } {
  const lineHeightMult = opts.lineHeightMult ?? 1.05;
  for (let size = opts.maxSize; size >= opts.minSize; size -= 0.1) {
    const lines = wrapByWidth(text, size, opts.maxWidth, font);
    const lineHeight = size * lineHeightMult;
    if (lines.length <= opts.maxLines && lines.length * lineHeight <= opts.maxHeight + 0.001) {
      return { size, lines, lineHeight };
    }
  }
  const size = opts.minSize;
  const lines = wrapByWidth(text, size, opts.maxWidth, font).slice(0, opts.maxLines);
  return { size, lines, lineHeight: size * lineHeightMult };
}

function drawFitted(
  page: PDFPage,
  text: string,
  font: PDFFont,
  x: number,
  yTop: number,
  opts: {
    maxWidth: number;
    maxHeight: number;
    minSize: number;
    maxSize: number;
    maxLines: number;
    lineHeightMult?: number;
    color: ReturnType<typeof rgb>;
  },
): void {
  const fitted = fitText(text, font, opts);
  let y = yTop;
  for (const line of fitted.lines) {
    page.drawText(line, { x, y, size: fitted.size, font, color: opts.color });
    y -= fitted.lineHeight;
  }
}

function drawTournamentAfterPrintedHeading(
  page: PDFPage,
  name: string,
  font: PDFFont,
  pageW: number,
  yTop: number,
  color: ReturnType<typeof rgb>,
): void {
  const t = TOURNAMENT_FIELD;
  const columnRightX = Math.min(pageW * t.columnRightFraction, t.columnRightMax);
  const lineHeightMult = t.lineHeightMult;
  for (let size = t.maxSize; size >= t.minSize; size -= 0.1) {
    const spaceW = font.widthOfTextAtSize(' ', size);
    const x = t.headingRightX + spaceW;
    const maxW = Math.max(20, columnRightX - x - 4);
    const lines = wrapByWidth(name, size, maxW, font).slice(0, t.maxLines);
    const lineHeight = size * lineHeightMult;
    if (lines.length * lineHeight <= t.maxHeight + 0.001) {
      let y = yTop;
      for (const line of lines) {
        page.drawText(line, { x, y, size, font, color });
        y -= lineHeight;
      }
      return;
    }
  }
  const size = t.minSize;
  const spaceW = font.widthOfTextAtSize(' ', size);
  const x = t.headingRightX + spaceW;
  const maxW = Math.max(20, columnRightX - x - 4);
  const lines = wrapByWidth(name, size, maxW, font).slice(0, t.maxLines);
  const lineHeight = size * lineHeightMult;
  let y = yTop;
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
}

type PlayerCellDims = {
  maxWidth: number;
  maxHeight: number;
  minSmall: number;
  maxSmall: number;
  minLarge: number;
  maxLarge: number;
  maxTeamLines: number;
  maxPlayerLines: number;
  gap: number;
  lineHeightMult: number;
  minPlayerFontAboveTeam: number;
  preferTeamNameSingleLineFirst: boolean;
};

function findUniformTeamSmall(
  cells: ReadonlyArray<{ teamName: string; a: string; b: string }>,
  font: PDFFont,
  dims: PlayerCellDims,
): number {
  const { maxWidth, maxHeight, gap, lineHeightMult } = dims;

  const fitsAtSmall = (small: number, maxTeamLinesAllowed: number): boolean => {
    for (const c of cells) {
      const teamText = `«${c.teamName}»`;
      const teamWrap = wrapByWidth(teamText, small, maxWidth, font);
      if (teamWrap.length > maxTeamLinesAllowed) return false;
      const hTeam = teamWrap.length * small * lineHeightMult;
      const remaining = maxHeight - gap - hTeam;
      const playersText = `${c.a} - ${c.b}`;
      const minLargeForRow = small + dims.minPlayerFontAboveTeam;
      let playerOk = false;
      for (let large = dims.maxLarge; large >= dims.minLarge; large -= 0.12) {
        if (large < minLargeForRow) continue;
        const pl = wrapByWidth(playersText, large, maxWidth, font).slice(0, dims.maxPlayerLines);
        const hp = pl.length * large * lineHeightMult;
        if (hp <= remaining + 0.45) {
          playerOk = true;
          break;
        }
      }
      if (!playerOk) return false;
    }
    return true;
  };

  const scan = (maxTeamLinesAllowed: number): number | null => {
    for (let small = dims.maxSmall; small >= dims.minSmall; small -= 0.1) {
      if (fitsAtSmall(small, maxTeamLinesAllowed)) return small;
    }
    return null;
  };

  if (dims.preferTeamNameSingleLineFirst) {
    const oneLine = scan(1);
    if (oneLine !== null) return oneLine;
  }
  const fallback = scan(dims.maxTeamLines);
  if (fallback !== null) return fallback;
  return dims.minSmall;
}

function drawPlayerCellFixedTeamSmall(
  page: PDFPage,
  font: PDFFont,
  teamName: string,
  playerA: string,
  playerB: string,
  x: number,
  yTop: number,
  teamSmall: number,
  dims: PlayerCellDims,
  color: ReturnType<typeof rgb>,
): void {
  const teamText = `«${teamName}»`;
  const playersText = `${playerA} - ${playerB}`;
  const { maxWidth, maxHeight, gap, lineHeightMult } = dims;

  const teamLines = wrapByWidth(teamText, teamSmall, maxWidth, font).slice(0, dims.maxTeamLines);
  const hTeam = teamLines.length * teamSmall * lineHeightMult;
  const remaining = maxHeight - gap - hTeam;

  const minPlayerPt = teamSmall + dims.minPlayerFontAboveTeam;
  let large = Math.max(dims.minLarge, minPlayerPt);
  let playerLines = wrapByWidth(playersText, large, maxWidth, font).slice(0, dims.maxPlayerLines);
  for (let tryLarge = dims.maxLarge; tryLarge >= dims.minLarge; tryLarge -= 0.12) {
    if (tryLarge < minPlayerPt) continue;
    const pl = wrapByWidth(playersText, tryLarge, maxWidth, font).slice(0, dims.maxPlayerLines);
    const hp = pl.length * tryLarge * lineHeightMult;
    if (hp <= remaining + 0.45) {
      large = tryLarge;
      playerLines = pl;
      break;
    }
  }

  let y = yTop;
  for (const ln of teamLines) {
    page.drawText(ln, { x, y, size: teamSmall, font, color });
    y -= teamSmall * lineHeightMult;
  }
  y -= gap;
  for (const ln of playerLines) {
    page.drawText(ln, { x, y, size: large, font, color });
    y -= large * lineHeightMult;
  }
}

function fillOneGamePage(
  page: PDFPage,
  font: PDFFont,
  pageW: number,
  gameColIndex: number,
  grid: number[][],
  bodyColor: ReturnType<typeof rgb>,
  cellDims: PlayerCellDims,
  uniformTeamSmall: number,
): void {
  const gameNo = gameColIndex + 1;
  const rows = LINEUP_PDF_TEAMS.map((t, ti) => ({
    t,
    seat: grid[ti]![gameColIndex]!,
  })).sort((a, b) => a.seat - b.seat);

  drawTournamentAfterPrintedHeading(page, HEADER_TEXT.tournament, font, pageW, TOURNAMENT_FIELD.y, bodyColor);

  drawFitted(page, HEADER_TEXT.date, font, DATE_FIELD.x, DATE_FIELD.y, {
    maxWidth: DATE_FIELD.maxWidth,
    maxHeight: DATE_FIELD.maxHeight,
    minSize: DATE_FIELD.minSize,
    maxSize: DATE_FIELD.maxSize,
    maxLines: DATE_FIELD.maxLines,
    color: bodyColor,
  });

  drawFitted(page, HEADER_TEXT.table, font, TABLE_NO_FIELD.x, TABLE_NO_FIELD.y, {
    maxWidth: TABLE_NO_FIELD.maxWidth,
    maxHeight: TABLE_NO_FIELD.maxHeight,
    minSize: TABLE_NO_FIELD.minSize,
    maxSize: TABLE_NO_FIELD.maxSize,
    maxLines: TABLE_NO_FIELD.maxLines,
    color: bodyColor,
  });

  drawFitted(page, String(gameNo), font, GAME_NO_FIELD.x, GAME_NO_FIELD.y, {
    maxWidth: GAME_NO_FIELD.maxWidth,
    maxHeight: GAME_NO_FIELD.maxHeight,
    minSize: GAME_NO_FIELD.minSize,
    maxSize: GAME_NO_FIELD.maxSize,
    maxLines: GAME_NO_FIELD.maxLines,
    color: bodyColor,
  });

  const pc = PLAYER_COLUMN;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]!;
    const y = pc.rowBaselineY[i]!;
    drawPlayerCellFixedTeamSmall(
      page,
      font,
      row.t.teamName,
      row.t.a,
      row.t.b,
      pc.colX,
      y + pc.topGap,
      uniformTeamSmall,
      cellDims,
      bodyColor,
    );
  }
}

async function main(): Promise<void> {
  const grid = buildRandomizedSeatsGrid();
  const columns = grid[0]?.length ?? 0;
  if (columns !== PROTOCOL_PDF_GAME_COUNT) {
    throw new Error(
      `PDF: в матрице рассадки ${columns} столбцов, в мастере PROTOCOL_PDF_GAME_COUNT=${PROTOCOL_PDF_GAME_COUNT}`,
    );
  }
  const templateBytes = await readFile(templatePath);
  const templatePdf = await PDFDocument.load(templateBytes);
  const outPdf = await PDFDocument.create();
  const font = await loadBodyFont(outPdf);
  const bodyColor = rgb(HEADER_BODY_RGB[0], HEADER_BODY_RGB[1], HEADER_BODY_RGB[2]);

  const pc = PLAYER_COLUMN;
  const cellDims: PlayerCellDims = {
    maxWidth: pc.maxW,
    maxHeight: pc.cellH,
    minSmall: pc.minSmall,
    maxSmall: pc.maxSmall,
    minLarge: pc.minLarge,
    maxLarge: pc.maxLarge,
    maxTeamLines: pc.maxTeamLines,
    maxPlayerLines: pc.maxPlayerLines,
    gap: pc.gap,
    lineHeightMult: pc.lineHeightMult,
    minPlayerFontAboveTeam: pc.minPlayerFontAboveTeamPt,
    preferTeamNameSingleLineFirst: pc.preferTeamNameSingleLineFirst,
  };

  const uniformTeamSmall = findUniformTeamSmall(
    LINEUP_PDF_TEAMS.map((t) => ({ teamName: t.teamName, a: t.a, b: t.b })),
    font,
    cellDims,
  );

  const templatePageIndex = 0;

  for (let gameColIndex = 0; gameColIndex < PROTOCOL_PDF_GAME_COUNT; gameColIndex += 1) {
    const [copied] = await outPdf.copyPages(templatePdf, [templatePageIndex]);
    outPdf.addPage(copied);
    const page = outPdf.getPage(outPdf.getPageCount() - 1);
    const { width: pageW } = page.getSize();
    fillOneGamePage(page, font, pageW, gameColIndex, grid, bodyColor, cellDims, uniformTeamSmall);
  }

  for (let b = 0; b < PROTOCOL_PDF_BLANK_TAIL_SHEETS; b += 1) {
    const [blank] = await outPdf.copyPages(templatePdf, [templatePageIndex]);
    outPdf.addPage(blank);
  }

  const bytes = await outPdf.save();
  await writeFile(outPathPublic, bytes);
  await writeFile(outPathDocs, bytes);
  // eslint-disable-next-line no-console -- служебный скрипт
  console.log(
    `Записано: ${outPathPublic} и ${outPathDocs} (${bytes.byteLength} байт), страниц: ${PROTOCOL_PDF_GAME_COUNT + PROTOCOL_PDF_BLANK_TAIL_SHEETS} (игр ${PROTOCOL_PDF_GAME_COUNT} + чистых ${PROTOCOL_PDF_BLANK_TAIL_SHEETS}), seed 0x${LINEUP_RANDOM_SEED.toString(16)}`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
