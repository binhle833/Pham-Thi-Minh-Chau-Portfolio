import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FFMPEG = 'C:\\Users\\minhc\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build-shared\\bin\\ffmpeg.exe';
const videoDir = 'D:/GEMINI DEMO/Antigraphity/Pham-Thi-Minh-Chau-Portfolio/video';
const outDir = 'D:/GEMINI DEMO/Antigraphity/Pham-Thi-Minh-Chau-Portfolio';
const scratchDir = 'C:/Users/minhc/.gemini/antigravity/brain/296cf253-0f83-4d81-ade4-e002c0f09cc2/scratch/portfolio-intro-new';

const srcFileName = fs.readdirSync(videoDir).find((f) => f.includes('cái này'));
const srcVideo = path.join(videoDir, srcFileName);
const outMp4 = path.join(outDir, 'Chau-Pham-Amazon-Operations-Intro-Edited.mp4');
const outMp4Fast = path.join(outDir, 'Chau-Pham-Amazon-Operations-Intro-Edited-1.12x.mp4');

fs.mkdirSync(scratchDir, { recursive: true });

// ---------------------------------------------------------------------------
// Curated Clean Takes from "cái này.mp4" with natural paragraph breathing room
// ---------------------------------------------------------------------------
const segments = [
  // 1a. Calm 1.2s lead-in + unhurried opening greeting ("Hi, my name is Chau Pham,") at 0.93x
  { start: 196.65, end: 200.40, speed: 0.93 },
  // 1b. ("and I'm based in Ho Chi Minh City, Vietnam." +0.30s breath)
  { start: 200.40, end: 209.75 },
  { start: 210.80, end: 218.20 },
  // 2. 15 Years Accounting & Data Operations
  { start: 218.25, end: 230.04 },
  { start: 230.42, end: 232.55 },
  // 3. Careful with Spreadsheets, Inventory Numbers, Reconciliations & Why Amazon Operations Caught My Eye (clean retake at 237.50)
  { start: 237.50, end: 251.76 },
  { start: 252.20, end: 258.55 },
  // 4. Full-time Team & Seller Central / FBA / PPC (+0.55s trailing breath before next paragraph)
  { start: 258.75, end: 273.15 },
  // 5. Hard Challenge: Digital Book Production & Web Landing Pages (+0.25s leading breath)
  { start: 289.95, end: 299.15 },
  { start: 300.95, end: 328.40 },
  // 6. Daily AI Tools Workflow (+0.28s leading breath, +0.42s trailing breath before final paragraph)
  { start: 345.25, end: 354.62 },
  { start: 356.10, end: 375.55 },
  // 7. ET Overlap, Reliability, Paid Trial & Outro (+0.30s leading breath)
  { start: 381.00, end: 396.85 },
  { start: 397.25, end: 399.20 },
];

// Clean 100% original framing (ZERO crop, ZERO delogo streaks, ZERO text overlays)
// Gentle studio lighting & color balance only
const VIDEO_GRADE = `fps=24,setsar=1,eq=brightness=0.035:contrast=1.06:saturation=1.05:gamma=1.04,colorbalance=rs=-0.01:gs=0.00:bs=0.02,unsharp=3:3:0.35:3:3:0.0`;

const filterParts = [];
const concatInputs = [];

segments.forEach((seg, idx) => {
  const spd = seg.speed || 1.0;
  const dur = +((seg.end - seg.start) / spd).toFixed(3);
  const fadeOutSt = Math.max(0, +(dur - 0.016).toFixed(3));
  const vPts = spd === 1.0 ? 'PTS-STARTPTS' : `(PTS-STARTPTS)/${spd}`;
  const aTempo = spd === 1.0 ? '' : `,atempo=${spd}`;
  filterParts.push(
    `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=${vPts},${VIDEO_GRADE}[v${idx}]`
  );
  filterParts.push(
    `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS${aTempo},afade=t=in:st=0:d=0.016,afade=t=out:st=${fadeOutSt}:d=0.016[a${idx}]`
  );
  concatInputs.push(`[v${idx}][a${idx}]`);
});

const totalEstDur = segments.reduce((acc, s) => acc + (s.end - s.start) / (s.speed || 1.0), 0);
const fadeOutVideoSt = +(totalEstDur - 0.55).toFixed(2);

filterParts.push(`${concatInputs.join('')}concat=n=${segments.length}:v=1:a=1[vcat][acat]`);
filterParts.push(`[vcat]split=2[vbase][vsrc];[vsrc]crop=98:38:0:644[vpatch];[vbase][vpatch]overlay=0:682,fade=t=in:st=0:d=0.25,fade=t=out:st=${fadeOutVideoSt}:d=0.45,format=yuv420p[vout]`);
filterParts.push(`[acat]highpass=f=85,lowpass=f=11000,afftdn=nf=-24,loudnorm=I=-16:TP=-1.5:LRA=9[aout]`);

console.log(`1. Rendering clean 1.0x portfolio intro from cái này.mp4 (${segments.length} segments, ~${totalEstDur.toFixed(1)}s)...`);
execFileSync(FFMPEG, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', srcVideo,
  '-filter_complex', filterParts.join(';'),
  '-map', '[vout]', '-map', '[aout]',
  '-r', '24',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart',
  outMp4,
], { stdio: 'inherit' });

console.log('2. Rendering 1.12x faster version...');
execFileSync(FFMPEG, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', outMp4,
  '-filter_complex', '[0:v]setpts=PTS/1.12,fps=24,format=yuv420p[v];[0:a]atempo=1.12[a]',
  '-map', '[v]', '-map', '[a]',
  '-r', '24',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart',
  outMp4Fast,
], { stdio: 'inherit' });

console.log('3. Extracting clean verification frame...');
execFileSync(FFMPEG, [
  '-y', '-hide_banner', '-loglevel', 'error', '-ss', '2.5', '-i', outMp4,
  '-frames:v', '1', '-update', '1', path.join(scratchDir, 'verify-clean-frame.jpg'),
], { stdio: 'inherit' });

console.log('ALL DONE!');
