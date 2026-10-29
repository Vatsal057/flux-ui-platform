import {
  ProjectInventory,
  DesignDirection,
  DesignBrief,
  ScreenPrompt,
  RouteScreenInfo,
  ComponentInfo
} from '@/types';

/**
 * Generates tailored ChatGPT image generation prompts for each screen in the project.
 */
export function generateScreenPromptsForDirection(
  inventory: ProjectInventory,
  direction: DesignDirection,
  brief?: DesignBrief
): ScreenPrompt[] {
  const screens = resolveProjectScreens(inventory);
  const domain = inventory.detectedDomain || 'web';

  return screens.map((screen, idx) => {
    const screenComponents = screen.componentsUsed.length > 0
      ? screen.componentsUsed
      : inventory.components.map(c => c.name);

    const componentDetails = getComponentDescriptions(screenComponents, inventory.components);
    const purpose = determineScreenPurpose(screen.name, domain, brief);

    const negativeConstraints = [
      'No generic AI purple-to-pink gradient backgrounds',
      'No blurry unreadable low-contrast text or illegible squiggles',
      'No abstract meaningless 3D floating spheres or metallic blobs',
      'No deformed UI controls, distorted checkboxes, or cut-off modals',
      'No placeholder "Lorem Ipsum" filler text — use realistic contextual metrics and labels'
    ].join(', ');

    const promptText = buildChatGptScreenPrompt({
      screenName: screen.name,
      routePath: screen.path,
      domain,
      purpose,
      direction,
      components: componentDetails,
      screenIndex: idx + 1,
      totalScreens: screens.length
    });

    return {
      screenId: `screen_${idx + 1}_${slugify(screen.name)}`,
      screenName: screen.name,
      routePath: screen.path,
      purpose,
      componentsIncluded: screenComponents,
      chatGptPrompt: promptText,
      negativeConstraints,
      recommendedAspect: '16:9 widescreen desktop'
    };
  });
}

interface PromptContext {
  screenName: string;
  routePath: string;
  domain: string;
  purpose: string;
  direction: DesignDirection;
  components: string[];
  screenIndex: number;
  totalScreens: number;
}

function buildChatGptScreenPrompt(ctx: PromptContext): string {
  const { direction } = ctx;
  const p = direction.palette;
  const t = direction.typography;
  const g = direction.geometry;

  return [
    `A high-fidelity modern production desktop UI screenshot of the "${ctx.screenName}" screen for a professional ${ctx.domain} web application.`,
    ``,
    `Design Direction: "${direction.name}"`,
    `- Philosophy & Mood: ${direction.mood}. ${direction.philosophy}`,
    `- Why it suits: ${direction.whyItSuits}`,
    ``,
    `Color Token Specifications:`,
    `- Background Canvas: ${p.background}`,
    `- Surface / Card Containers: ${p.surface} (secondary layer: ${p.surfaceSecondary})`,
    `- Primary Brand Accent: ${p.primary}`,
    `- Data / Secondary Accent: ${p.accent}`,
    `- Hairline Borders: ${p.border}`,
    `- Text Hierarchy: High-contrast primary foreground ${p.foreground}, muted metadata ${p.foregroundMuted}`,
    ``,
    `Typography Rules:`,
    `- Heading Typography: ${t.headingFont} with tight tracking (${t.headingTracking})`,
    `- Body Typography: ${t.bodyFont} (line height ${t.bodyLeading})`,
    `- Monospace Data: ${t.monoFont} for numeric tables, metrics, codes, and values`,
    ``,
    `Component Geometry & Surfaces:`,
    `- Border Radius: ${g.borderRadius}`,
    `- Border Width: ${g.borderWidth} crisp separation line`,
    `- Shadow Treatment: ${g.shadowStyle}`,
    `- Button Style: ${g.buttonVariant}`,
    `- Grid Principle: ${direction.layoutPrinciple}`,
    ``,
    `Screen Layout & Specific UI Elements ("${ctx.screenName}"):`,
    `- Purpose: ${ctx.purpose}`,
    `- Header Navigation: Sleek topbar with brand mark, route breadcrumb "${ctx.routePath}", project switcher, and status indicator`,
    `- Core Active Components to Display:`,
    ...ctx.components.map(c => `  * ${c}`),
    `- Data Realism: Populate with crisp, realistic ${ctx.domain} data points, currency/units, status tags, and clear column headers`,
    ``,
    `Visual & Rendering Constraints:`,
    `- Crisp 16:9 widescreen desktop perspective (1920x1080 resolution), Figma/Linear studio render`,
    `- Strict high-contrast accessibility (WCAG AA compliant)`,
    `- Zero generic purple AI gradients, zero floating 3D spheres, zero distorted controls, zero blurry pseudo-text`
  ].join('\n');
}

/**
 * Resolves screens from project inventory.
 * If multiple routes exist, use them.
 * If single route, synthesize logical modular views (Dashboard, Data Table, Entry Form)
 * so every major aspect of the product gets its own dedicated prompt.
 */
function resolveProjectScreens(inventory: ProjectInventory): RouteScreenInfo[] {
  if (inventory.routes && inventory.routes.length > 1) {
    return inventory.routes;
  }

  // Single-route or entry-only app
  const entryRoute = inventory.routes?.[0] || {
    path: '/',
    name: 'Main Application Screen',
    filePath: inventory.entryPoint || 'src/App.tsx',
    isEntry: true,
    componentsUsed: inventory.components.map(c => c.name)
  };

  const screens: RouteScreenInfo[] = [
    {
      ...entryRoute,
      name: 'Main Application Screen'
    }
  ];

  // If there are forms or tables that warrant dedicated focused screens
  const tableComponents = inventory.components.filter(c => c.type === 'table' || c.name.toLowerCase().includes('list'));
  const formComponents = inventory.components.filter(c => c.type === 'form' || c.name.toLowerCase().includes('form'));

  if (tableComponents.length > 0) {
    screens.push({
      path: '/data-ledger',
      name: 'Data & Ledger Table View',
      filePath: tableComponents[0].filePath,
      isEntry: false,
      componentsUsed: tableComponents.map(c => c.name)
    });
  }

  if (formComponents.length > 0) {
    screens.push({
      path: '/creation-flow',
      name: 'Action & Entry Modal View',
      filePath: formComponents[0].filePath,
      isEntry: false,
      componentsUsed: formComponents.map(c => c.name)
    });
  }

  return screens;
}

function getComponentDescriptions(compNames: string[], allComps: ComponentInfo[]): string[] {
  return compNames.map(name => {
    const found = allComps.find(c => c.name === name);
    if (!found) return `${name}: Interactive UI component with state and action handlers`;

    const propsList = found.props.length > 0 ? ` (props: ${found.props.join(', ')})` : '';
    const handlersList = found.eventHandlers.length > 0 ? ` (events: ${found.eventHandlers.join(', ')})` : '';
    return `${found.name} (${found.type}): Functional ${found.type} block${propsList}${handlersList}`;
  });
}

function determineScreenPurpose(screenName: string, domain: string, brief?: DesignBrief): string {
  if (brief?.applicationPurpose) {
    return `${screenName} facilitating ${brief.applicationPurpose}`;
  }
  return `Primary interface for ${domain} operations, data inspection, and interaction`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Generates an exportable Markdown document containing prompts for all screens.
 */
export function generateAllScreenPromptsMarkdown(
  projectName: string,
  direction: DesignDirection,
  prompts: ScreenPrompt[]
): string {
  return [
    `# ChatGPT UI Reference Image Generation Prompts`,
    ``,
    `**Project**: ${projectName}  `,
    `**Design Direction**: ${direction.name} — *"${direction.tagline}"*  `,
    `**Mood**: ${direction.mood}  `,
    `**Philosophy**: ${direction.philosophy}  `,
    ``,
    `---`,
    ``,
    `## How to Use These Prompts with ChatGPT`,
    `1. Open [ChatGPT](https://chatgpt.com/) (GPT-4o / DALL-E 3).`,
    `2. Copy any of the screen prompts below verbatim.`,
    `3. Paste into ChatGPT to generate a photorealistic 16:9 UI mockup.`,
    `4. Save the generated image and upload it to FLUX as the screen's visual reference.`,
    `5. FLUX's transformation engine will inspect the image and refactor the code to match!`,
    ``,
    `---`,
    ``,
    ...prompts.map((p, idx) => [
      `## Screen ${idx + 1}: ${p.screenName} (\`${p.routePath}\`)`,
      ``,
      `**Purpose**: ${p.purpose}  `,
      `**Components Covered**: ${p.componentsIncluded.join(', ')}  `,
      `**Recommended Aspect Ratio**: ${p.recommendedAspect}  `,
      ``,
      `### Prompt for ChatGPT:`,
      `\`\`\``,
      p.chatGptPrompt,
      `\`\`\``,
      ``,
      `---`,
      ``
    ].join('\n'))
  ].join('\n');
}
