import path from 'node:path';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const ARTIFACTS_DIR = '/Users/vatsal/.gemini/antigravity/brain/6e9e1396-ed78-4b15-a6fc-6cf249fc5de5';

// Before HTML: Generic AI Look (HabitZen)
const beforeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HabitZen - Before (Generic AI UI)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f9fafb; color: #111827; }
  </style>
</head>
<body class="min-h-screen bg-gray-50 flex flex-col font-sans">
  <!-- Generic AI Rounded Header -->
  <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
        HZ
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">HabitZen Tracker</h1>
        <p class="text-xs text-gray-500">Daily routine &amp; mindfulness tracker</p>
      </div>
    </div>

    <div class="flex space-x-2">
      <button class="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm">Today</button>
      <button class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Analytics</button>
      <button class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Habits</button>
      <button class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Settings</button>
    </div>

    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow">
      Quick Check-in
    </button>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-8 space-y-6">
    <!-- Generic White Card Banner -->
    <div class="bg-white rounded-lg shadow border border-gray-200 p-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Today’s Mindful Intentions</h2>
        <p class="text-sm text-gray-500 mt-1">Cultivate daily focus, physical vitality, and mental serenity.</p>
      </div>
      <div class="flex space-x-2">
        <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm">All</button>
        <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">Mindfulness</button>
        <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">Fitness</button>
        <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">Focus</button>
      </div>
    </div>

    <!-- Generic Stats Row -->
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
        <span class="text-xs text-gray-500 font-medium">Active Routines</span>
        <p class="text-3xl font-bold text-gray-900 mt-1">3</p>
      </div>
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
        <span class="text-xs text-gray-500 font-medium">Completed Today</span>
        <p class="text-3xl font-bold text-blue-600 mt-1">2</p>
      </div>
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5 text-center">
        <span class="text-xs text-gray-500 font-medium">Longest Streak</span>
        <p class="text-3xl font-bold text-amber-500 mt-1">21 days</p>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Habit List -->
      <div class="col-span-2 space-y-3">
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-bold text-gray-900 text-sm">Your Active Commitments</h3>
          <span class="text-xs text-gray-500">3 routines shown</span>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
            <div>
              <h4 class="text-sm font-semibold line-through text-gray-400">15-Minute Morning Pranayama Breathwork</h4>
              <span class="text-xs text-blue-500 font-medium uppercase">Mindfulness</span>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">🔥 14 days</span>
            <button class="text-xs text-red-500 hover:text-red-700">Delete</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 rounded-full border-2 border-gray-300"></div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">5km Forest Trail Run</h4>
              <span class="text-xs text-blue-500 font-medium uppercase">Fitness</span>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">🔥 8 days</span>
            <button class="text-xs text-red-500 hover:text-red-700">Delete</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
            <div>
              <h4 class="text-sm font-semibold line-through text-gray-400">Deep Architectural Code Review (No Slack)</h4>
              <span class="text-xs text-blue-500 font-medium uppercase">Focus</span>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">🔥 21 days</span>
            <button class="text-xs text-red-500 hover:text-red-700">Delete</button>
          </div>
        </div>
      </div>

      <!-- Add Habit Form -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-5 space-y-4">
        <h3 class="text-sm font-bold text-gray-900">Establish New Habit</h3>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Habit Name</label>
          <input type="text" placeholder="e.g. Cold Plunge" class="w-full border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Pillar</label>
          <select class="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900">
            <option>Mindfulness &amp; Calm</option>
            <option>Physical Movement</option>
            <option>Deep Focus</option>
          </select>
        </div>
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs shadow">
          Create Routine
        </button>
      </div>
    </div>
  </main>
</body>
</html>
`;

// After HTML: Transformed by FLUX into "Architectural Monolith"
const afterHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HabitZen - After (FLUX Redesigned UI)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    :root {
      --flux-bg: #0a0a0c;
      --flux-surface: #121216;
      --flux-surface-secondary: #1a1a20;
      --flux-fg: #fafafa;
      --flux-fg-muted: #71717a;
      --flux-primary: #fafafa;
      --flux-primary-fg: #09090b;
      --flux-border: #27272a;
      --flux-accent: #f59e0b;
      --flux-radius: 0px;
    }
    body {
      background-color: var(--flux-bg);
      color: var(--flux-fg);
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4 {
      font-family: 'Syne', sans-serif;
      letter-spacing: -0.04em;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen bg-[#0a0a0c] text-[#fafafa] flex flex-col font-sans">
  <!-- Architectural Navbar -->
  <header class="bg-[#121216] border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-none bg-[#fafafa] flex items-center justify-center text-[#0a0a0c] font-black text-xs">
        HZ
      </div>
      <div>
        <h1 class="text-base font-extrabold uppercase tracking-widest text-[#fafafa]">HabitZen Monolith</h1>
        <p class="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">Aesthetic Health Telemetry</p>
      </div>
    </div>

    <div class="flex border border-[#27272a] p-0.5 rounded-none bg-[#0a0a0c]">
      <button class="px-4 py-1.5 bg-[#fafafa] text-[#0a0a0c] font-bold text-xs uppercase tracking-wider">Today</button>
      <button class="px-4 py-1.5 text-[#71717a] hover:text-[#fafafa] text-xs font-mono uppercase">Analytics</button>
      <button class="px-4 py-1.5 text-[#71717a] hover:text-[#fafafa] text-xs font-mono uppercase">Habits</button>
      <button class="px-4 py-1.5 text-[#71717a] hover:text-[#fafafa] text-xs font-mono uppercase">Settings</button>
    </div>

    <button class="border border-[#fafafa] bg-transparent text-[#fafafa] hover:bg-[#fafafa] hover:text-[#0a0a0c] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors">
      [+ Check-in]
    </button>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-8 space-y-6">
    <!-- Top Monolithic Banner -->
    <div class="bg-[#121216] border border-[#27272a] p-6 flex items-center justify-between relative overflow-hidden">
      <div class="space-y-1">
        <span class="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b]">Active Pacing Protocol</span>
        <h2 class="text-2xl font-black text-[#fafafa] uppercase tracking-tight">Today’s Mindful Intentions</h2>
        <p class="text-xs text-[#71717a]">Disciplined cognitive pacing, structural physical vitality, and silent focus.</p>
      </div>
      <div class="flex border border-[#27272a]">
        <button class="px-3 py-1.5 bg-[#fafafa] text-[#0a0a0c] font-mono text-[11px] font-bold uppercase">All</button>
        <button class="px-3 py-1.5 text-[#71717a] hover:text-[#fafafa] font-mono text-[11px] border-l border-[#27272a] uppercase">Mindfulness</button>
        <button class="px-3 py-1.5 text-[#71717a] hover:text-[#fafafa] font-mono text-[11px] border-l border-[#27272a] uppercase">Fitness</button>
        <button class="px-3 py-1.5 text-[#71717a] hover:text-[#fafafa] font-mono text-[11px] border-l border-[#27272a] uppercase">Focus</button>
      </div>
    </div>

    <!-- Precision Stats Grid -->
    <div class="grid grid-cols-3 border border-[#27272a] divide-x divide-[#27272a] bg-[#121216]">
      <div class="p-5">
        <span class="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">Total Active</span>
        <p class="text-3xl font-extrabold font-mono text-[#fafafa] mt-1">03</p>
      </div>
      <div class="p-5">
        <span class="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">Executed Today</span>
        <p class="text-3xl font-extrabold font-mono text-[#10b981] mt-1">02 / 03</p>
      </div>
      <div class="p-5">
        <span class="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">Peak Streak</span>
        <p class="text-3xl font-extrabold font-mono text-[#f59e0b] mt-1">21 DYS</p>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Habit List -->
      <div class="col-span-2 space-y-2">
        <div class="flex justify-between items-center py-1 border-b border-[#27272a]">
          <span class="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Active Execution Registry</span>
          <span class="text-[10px] font-mono text-[#71717a]">[3 Synced]</span>
        </div>

        <div class="bg-[#121216] border border-[#27272a] p-4 flex items-center justify-between hover:border-[#fafafa] transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-5 h-5 bg-[#fafafa] text-[#0a0a0c] flex items-center justify-center text-xs font-bold font-mono">■</div>
            <div>
              <h4 class="text-sm font-bold text-[#fafafa] tracking-wide">15-Minute Morning Pranayama Breathwork</h4>
              <span class="text-[10px] font-mono text-[#f59e0b] uppercase tracking-wider">● Mindfulness</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs font-mono font-bold text-[#fafafa] bg-[#1a1a20] px-2.5 py-1 border border-[#27272a]">14 DYS</span>
            <button class="text-[11px] font-mono text-[#71717a] hover:text-[#ef4444] uppercase">Del</button>
          </div>
        </div>

        <div class="bg-[#121216] border border-[#27272a] p-4 flex items-center justify-between hover:border-[#fafafa] transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-5 h-5 border border-[#71717a] flex items-center justify-center text-xs"></div>
            <div>
              <h4 class="text-sm font-bold text-[#fafafa] tracking-wide">5km Forest Trail Run</h4>
              <span class="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">○ Fitness</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs font-mono font-bold text-[#fafafa] bg-[#1a1a20] px-2.5 py-1 border border-[#27272a]">08 DYS</span>
            <button class="text-[11px] font-mono text-[#71717a] hover:text-[#ef4444] uppercase">Del</button>
          </div>
        </div>

        <div class="bg-[#121216] border border-[#27272a] p-4 flex items-center justify-between hover:border-[#fafafa] transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-5 h-5 bg-[#fafafa] text-[#0a0a0c] flex items-center justify-center text-xs font-bold font-mono">■</div>
            <div>
              <h4 class="text-sm font-bold text-[#fafafa] tracking-wide">Deep Architectural Code Review (No Slack)</h4>
              <span class="text-[10px] font-mono text-[#10b981] uppercase tracking-wider">● Focus</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs font-mono font-bold text-[#fafafa] bg-[#1a1a20] px-2.5 py-1 border border-[#27272a]">21 DYS</span>
            <button class="text-[11px] font-mono text-[#71717a] hover:text-[#ef4444] uppercase">Del</button>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="bg-[#121216] border border-[#27272a] p-5 space-y-4">
        <div class="border-b border-[#27272a] pb-2">
          <span class="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">New Protocol</span>
          <h3 class="text-sm font-bold text-[#fafafa] uppercase">Establish Routine</h3>
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-[#71717a] mb-1">Routine Descriptor</label>
          <input type="text" placeholder="e.g. Cold Plunge Pacing" class="w-full bg-[#0a0a0c] border border-[#27272a] p-2.5 text-xs text-[#fafafa] focus:border-[#fafafa] outline-none font-mono">
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase text-[#71717a] mb-1">Core Discipline</label>
          <select class="w-full bg-[#0a0a0c] border border-[#27272a] p-2 text-xs text-[#fafafa] outline-none font-mono">
            <option>Mindfulness &amp; Calm</option>
            <option>Physical Movement</option>
            <option>Deep Focus</option>
          </select>
        </div>
        <button class="w-full bg-[#fafafa] hover:bg-[#e4e4e7] text-[#0a0a0c] font-black py-2.5 text-xs uppercase tracking-wider transition-colors">
          Commit Protocol
        </button>
      </div>
    </div>
  </main>
</body>
</html>
`;

async function capture() {
  const tmpBefore = path.join(ARTIFACTS_DIR, 'before_preview.html');
  const tmpAfter = path.join(ARTIFACTS_DIR, 'after_preview.html');
  const beforePng = path.join(ARTIFACTS_DIR, 'before_generic_ui.png');
  const afterPng = path.join(ARTIFACTS_DIR, 'after_transformed_ui.png');

  await fs.writeFile(tmpBefore, beforeHtml, 'utf8');
  await fs.writeFile(tmpAfter, afterHtml, 'utf8');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  console.log('Capturing BEFORE screenshot with Headless Chrome...');
  await execAsync(`"${chromePath}" --headless --disable-gpu --screenshot="${beforePng}" --window-size=1280,820 "file://${tmpBefore}"`);

  console.log('Capturing AFTER screenshot with Headless Chrome...');
  await execAsync(`"${chromePath}" --headless --disable-gpu --screenshot="${afterPng}" --window-size=1280,820 "file://${tmpAfter}"`);

  const statBefore = await fs.stat(beforePng);
  const statAfter = await fs.stat(afterPng);

  console.log(`[PASS] Before PNG captured: ${statBefore.size} bytes at ${beforePng}`);
  console.log(`[PASS] After PNG captured: ${statAfter.size} bytes at ${afterPng}`);
}

capture().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
