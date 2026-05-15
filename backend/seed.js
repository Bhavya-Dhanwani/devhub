import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { Blog } from "./src/models/blog.model.js";
import { User } from "./src/models/user.model.js";
import { slugify } from "./src/utils/slugify.js";

const seedAuthor = {
  name: "DevHub Seed Writer",
  email: "seed.writer@devhub.local",
  password: "SeedWriter123!",
  avatar: "",
  isEmailVerified: true,
};

const blogSeeds = [
  {
    title: "Building Reliable Authentication With Access And Refresh Tokens",
    category: "backend",
    tags: ["auth", "jwt", "nodejs", "security"],
    subheading: "A practical token flow for modern Express apps.",
    content: [
      "## Why token shape matters",
      "A clean auth system separates short lived access tokens from longer lived refresh tokens. The access token protects APIs, while the refresh token keeps sessions smooth without exposing long lived credentials to JavaScript.",
      "## Production checklist",
      "- Store refresh tokens in httpOnly cookies",
      "- Rotate refresh tokens during refresh",
      "- Keep access tokens short lived",
      "- Clear cookies during logout",
      "```js\nconst accessToken = createAccessToken(user);\nconst refreshToken = createRefreshToken(user);\n```",
      "#auth #security #nodejs",
    ].join("\n\n"),
  },
  {
    title: "Designing A Blog Editor That Does Not Fight The Writer",
    category: "frontend",
    tags: ["react", "editor", "ux", "frontend"],
    subheading: "Editor controls should help without stealing attention.",
    content: [
      "## Keep the canvas calm",
      "A writing editor needs a quiet center. Toolbars should be reachable, but the text should remain the primary object on the page.",
      "## Useful controls",
      "- Cover image upload",
      "- Inline image insertion",
      "- Markdown block shortcuts",
      "- Undo and redo stack memory",
      "> The best editor UI disappears until the writer needs it.",
      "#react #ux #frontend",
    ].join("\n\n"),
  },
  {
    title: "MongoDB Indexes Every Node Developer Should Understand",
    category: "database",
    tags: ["mongodb", "database", "nodejs", "performance"],
    subheading: "Indexes are product features when your app starts growing.",
    content: [
      "## Start with query patterns",
      "Indexes should match the way users search, sort, and filter data. A blog app often needs indexes on author, status, createdAt, tags, and text fields.",
      "## Common patterns",
      "- Compound indexes for filtered lists",
      "- Text indexes for search",
      "- Unique indexes for slugs",
      "```js\nblogSchema.index({ author: 1, createdAt: -1 });\nblogSchema.index({ title: \"text\", content: \"text\" });\n```",
      "#mongodb #database #performance",
    ].join("\n\n"),
  },
  {
    title: "A Simple Mental Model For React State",
    category: "react",
    tags: ["react", "state", "frontend"],
    subheading: "Put state where the change actually belongs.",
    content: [
      "## Local first",
      "Start with local component state. Move state upward only when another component genuinely needs it.",
      "## When to lift state",
      "- Sibling components need the same value",
      "- A page needs to coordinate multiple controls",
      "- A persisted global concern exists",
      "For editor history, a hook can own the stack because the behavior belongs to the composer.",
      "#react #frontend",
    ].join("\n\n"),
  },
  {
    title: "How To Structure Express Controllers And Services",
    category: "backend",
    tags: ["express", "architecture", "nodejs"],
    subheading: "Thin controllers make backends easier to change.",
    content: [
      "## Routes should route",
      "Routes define endpoints. Controllers translate requests and responses. Services own business logic.",
      "## Separation pays off",
      "- Validators stay reusable",
      "- Services stay testable",
      "- Controllers stay readable",
      "```js\nrouter.post(\"/blogs\", authenticate, validateBody(schema), createBlogController);\n```",
      "#express #architecture #nodejs",
    ].join("\n\n"),
  },
  {
    title: "Why Slugs Need Collision Handling",
    category: "backend",
    tags: ["seo", "backend", "mongodb"],
    subheading: "The second post with the same title still needs a stable URL.",
    content: [
      "## Slugs are user facing identifiers",
      "A slug should be readable, stable, and unique. When two posts share a title, append a suffix instead of failing the whole publish flow.",
      "## A safe flow",
      "- Create a base slug",
      "- Check if it exists",
      "- Append a numeric suffix",
      "- Save the final slug",
      "#seo #backend",
    ].join("\n\n"),
  },
  {
    title: "Shipping Image Uploads Without Making The Editor Ugly",
    category: "frontend",
    tags: ["images", "editor", "ux", "react"],
    subheading: "Large data URLs should never be the editing experience.",
    content: [
      "## Show compact tokens",
      "Inline images can be stored as full data URLs or uploaded assets, but the editor should show a short placeholder while writing.",
      "## Better writing experience",
      "- Keep the textarea readable",
      "- Expand image tokens only when publishing",
      "- Render images cleanly in preview",
      "#images #editor #ux",
    ].join("\n\n"),
  },
  {
    title: "Debouncing Undo History In A Text Editor",
    category: "frontend",
    tags: ["react", "editor", "performance"],
    subheading: "Undo should move through thoughts, not individual letters.",
    content: [
      "## Group typing",
      "If every keystroke becomes history, undo becomes noisy. Debounce typing and throttle long sessions so the stack feels natural.",
      "## Practical numbers",
      "- Debounce after 700ms of quiet",
      "- Force a checkpoint every few seconds",
      "- Commit file and toolbar actions immediately",
      "```js\nconst HISTORY_DEBOUNCE_MS = 700;\nconst HISTORY_THROTTLE_MS = 2500;\n```",
      "#react #editor #performance",
    ].join("\n\n"),
  },
  {
    title: "The Small CSS Rules That Save Dashboard Cards",
    category: "css",
    tags: ["css", "ui", "frontend"],
    subheading: "Cards should not break when content is messy.",
    content: [
      "## Content will be weird",
      "Titles get long, URLs leak into excerpts, and users paste unexpected strings. UI should handle this gracefully.",
      "## Defensive card CSS",
      "- Set min-width: 0 on grid children",
      "- Use line clamps for summaries",
      "- Add overflow-wrap: anywhere for hostile strings",
      "```css\n.card p {\n  overflow-wrap: anywhere;\n  -webkit-line-clamp: 3;\n}\n```",
      "#css #ui #frontend",
    ].join("\n\n"),
  },
  {
    title: "Building A Real Feed From Blog Data",
    category: "product",
    tags: ["feed", "product", "data"],
    subheading: "A feed should reflect real activity, not placeholder numbers.",
    content: [
      "## Derive sections from posts",
      "Popular posts can sort by views, active writers can count published articles, and trending tags can aggregate tag usage.",
      "## Feed metrics",
      "- Recent posts",
      "- Unique writers",
      "- Tag frequency",
      "- Category performance",
      "#feed #product #data",
    ].join("\n\n"),
  },
  {
    title: "Protecting Draft Preview Routes",
    category: "security",
    tags: ["auth", "security", "nextjs"],
    subheading: "Drafts should be visible only to their owners.",
    content: [
      "## Public and private routes are different",
      "Published blogs can use slug routes. Drafts should use authenticated owner-only preview endpoints.",
      "## Access rule",
      "The server should query by both blog id and author id. That way a logged in user cannot preview someone else's draft.",
      "```js\nBlog.findOne({ _id: blogId, author: userId });\n```",
      "#auth #security #nextjs",
    ].join("\n\n"),
  },
  {
    title: "Writing Markdown Renderers Without Overbuilding",
    category: "frontend",
    tags: ["markdown", "react", "frontend"],
    subheading: "Sometimes a focused renderer is enough.",
    content: [
      "## Parse what your product supports",
      "A blog preview may only need headings, paragraphs, lists, quotes, code, and images. Start there before adding a full markdown pipeline.",
      "## Supported blocks",
      "- Headings",
      "- Lists",
      "- Quotes",
      "- Fenced code",
      "- Images",
      "#markdown #react",
    ].join("\n\n"),
  },
  {
    title: "Next.js Client Data Fetching For Authenticated Dashboards",
    category: "nextjs",
    tags: ["nextjs", "react", "dashboard"],
    subheading: "Client hooks are useful when tokens live in client state.",
    content: [
      "## Keep protected data behind auth",
      "If your API client attaches access tokens from Redux state, protected dashboard data belongs in client hooks.",
      "## Keep pages thin",
      "- App routes render feature components",
      "- Feature hooks fetch data",
      "- UI components receive props",
      "#nextjs #dashboard #react",
    ].join("\n\n"),
  },
  {
    title: "The Difference Between Drafts And Published Posts",
    category: "product",
    tags: ["cms", "workflow", "product"],
    subheading: "Status changes the whole visibility model.",
    content: [
      "## Drafts are private work",
      "A draft belongs in the writer workspace. Published posts belong in the public feed.",
      "## Product behavior",
      "- Drafts show in /write/drafts",
      "- Published posts show in the homepage feed",
      "- Both can be previewed by the owner",
      "#cms #workflow",
    ].join("\n\n"),
  },
  {
    title: "Why API Response Shapes Should Stay Consistent",
    category: "api",
    tags: ["api", "backend", "architecture"],
    subheading: "Frontend code gets simpler when payloads are predictable.",
    content: [
      "## Wrap responses consistently",
      "A response wrapper can hold success, statusCode, message, and data. Frontend clients can then unwrap predictable paths.",
      "## Example",
      "```js\nres.status(200).json(new ApiResponse(200, { blog }, \"Blog fetched\"));\n```",
      "#api #backend",
    ].join("\n\n"),
  },
  {
    title: "Clean File Upload Middleware In Express",
    category: "backend",
    tags: ["express", "uploads", "images"],
    subheading: "Centralized upload rules make controllers smaller.",
    content: [
      "## Middleware owns file concerns",
      "Use multer configuration for file size, accepted mime types, and field names. Services can focus on storage.",
      "## Upload checks",
      "- Accept only image mime types",
      "- Cap file size",
      "- Increase field size when markdown includes inline image data",
      "#express #uploads",
    ].join("\n\n"),
  },
  {
    title: "A Practical Guide To Blog Read Time",
    category: "product",
    tags: ["blogging", "ux", "data"],
    subheading: "Read time is simple, but it sets reader expectations.",
    content: [
      "## Keep it understandable",
      "A common rule is around 200 words per minute. It is not perfect, but it gives readers a useful signal.",
      "## Implementation",
      "```js\nconst minutes = Math.max(1, Math.ceil(wordCount / 200));\n```",
      "#blogging #ux",
    ].join("\n\n"),
  },
  {
    title: "How To Build Searchable Blog Content",
    category: "database",
    tags: ["search", "mongodb", "blogging"],
    subheading: "Start with text indexes before reaching for heavier search tools.",
    content: [
      "## Use the database first",
      "MongoDB text indexes can cover title, heading, subheading, content, and tags for a strong first version.",
      "## When to upgrade",
      "- Ranking needs more nuance",
      "- You need typo tolerance",
      "- Search analytics become important",
      "#search #mongodb",
    ].join("\n\n"),
  },
  {
    title: "Frontend Empty States Should Be Honest",
    category: "ui",
    tags: ["ui", "frontend", "product"],
    subheading: "Do not pretend the app has data it does not have.",
    content: [
      "## Real empty states build trust",
      "Fake cards look nice until users realize nothing is real. Empty states should explain what happens next.",
      "## Good empty states",
      "- Say what is missing",
      "- Offer a next action",
      "- Avoid fake metrics",
      "#ui #product",
    ].join("\n\n"),
  },
  {
    title: "Using Tags To Shape Developer Discovery",
    category: "product",
    tags: ["tags", "discovery", "blogging"],
    subheading: "Tags are lightweight navigation for technical writing.",
    content: [
      "## Tags connect related posts",
      "Readers often browse by topic. Good tags make backend, frontend, security, and product writing easier to discover.",
      "## Tag rules",
      "- Normalize casing",
      "- Strip hashtag prefixes",
      "- Deduplicate values",
      "#tags #discovery",
    ].join("\n\n"),
  },
  {
    title: "Building A Safer Logout Flow",
    category: "security",
    tags: ["auth", "security", "cookies"],
    subheading: "Logout should clear both client state and server refresh state.",
    content: [
      "## Clear both sides",
      "Client state removes UI access. Server-side refresh token invalidation prevents silent session recovery.",
      "## Flow",
      "- Call logout endpoint",
      "- Clear refresh cookie",
      "- Remove access token from state",
      "- Redirect to login",
      "#auth #cookies #security",
    ].join("\n\n"),
  },
  {
    title: "Designing Sidebar Navigation For Creator Tools",
    category: "ui",
    tags: ["ui", "navigation", "dashboard"],
    subheading: "Creator tools need fast paths to writing and drafts.",
    content: [
      "## Separate intent",
      "A Write link should start or manage creation. A Drafts link should show only unfinished work.",
      "## Navigation rules",
      "- Keep active states clear",
      "- Avoid duplicate destinations",
      "- Make mobile spacing resilient",
      "#ui #navigation",
    ].join("\n\n"),
  },
  {
    title: "Why Backend Seeds Should Be Idempotent",
    category: "backend",
    tags: ["seed", "mongodb", "developer-experience"],
    subheading: "A seed script should be safe to run more than once.",
    content: [
      "## Avoid duplicates",
      "Seed scripts are often run during setup, demos, and local resets. Upsert by slug so repeated runs update known records.",
      "## Seed checklist",
      "- Create a stable seed author",
      "- Generate deterministic slugs",
      "- Upsert posts",
      "- Print a clear summary",
      "#seed #mongodb #dx",
    ].join("\n\n"),
  },
  {
    title: "Rendering Code Blocks In A Blog Preview",
    category: "frontend",
    tags: ["markdown", "code", "frontend"],
    subheading: "Technical blogs need code that is readable.",
    content: [
      "## Preserve whitespace",
      "Fenced code blocks should render inside pre and code tags with horizontal scrolling for long lines.",
      "```js\nfunction greet(name) {\n  return `Hello ${name}`;\n}\n```",
      "## Keep it quiet",
      "A dark code surface with a subtle border is enough for most product UIs.",
      "#markdown #code",
    ].join("\n\n"),
  },
  {
    title: "Tiny Performance Wins In React Lists",
    category: "react",
    tags: ["react", "performance", "frontend"],
    subheading: "Fast interfaces are often built from small habits.",
    content: [
      "## Render less surprise",
      "Use stable keys, keep transformations predictable, and avoid expensive work inside deeply repeated children.",
      "## Practical habits",
      "- Map API data once near the component",
      "- Keep card components simple",
      "- Clamp text to protect layout",
      "#react #performance",
    ].join("\n\n"),
  },
];

function generateExcerpt(content) {
  const cleaned = String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\s*\((?:data:image\/[^)]+|https?:\/\/[^)]+)\)/gi, " ")
    .replace(/[#*_>`~[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 160 ? `${cleaned.slice(0, 160).trim()}...` : cleaned;
}

function calculateReadTime(content) {
  const wordCount = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function deterministicViews(index) {
  return 24 + index * 17;
}

async function ensureSeedAuthor() {
  const existingUser = await User.findOne({ email: seedAuthor.email });

  if (existingUser) {
    return existingUser;
  }

  return User.create(seedAuthor);
}

async function seed() {
  await connectDB();
  const author = await ensureSeedAuthor();

  for (const [index, blog] of blogSeeds.entries()) {
    const slug = slugify(blog.title);
    const now = new Date(Date.now() - index * 6 * 60 * 60 * 1000);

    await Blog.updateOne(
      { slug },
      {
        $set: {
          ...blog,
          author: author._id,
          excerpt: generateExcerpt(blog.content),
          isFeatured: index < 4,
          likesCount: Math.floor(deterministicViews(index) / 5),
          commentsCount: index % 4,
          readTime: calculateReadTime(blog.content),
          status: "published",
          views: deterministicViews(index),
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          slug,
        },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${blogSeeds.length} tech blogs.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
