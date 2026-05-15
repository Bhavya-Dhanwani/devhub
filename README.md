# DevHub

DevHub is a full-stack developer publishing platform where users can write blogs, publish project writeups, manage a public profile, follow other writers, search published work, bookmark posts, comment, like, and track author dashboard stats.

The codebase has two applications:

- `frontend`: Next.js App Router UI built with React 19, Redux Toolkit, React Query, Axios, CSS modules, and Lucide icons.
- `backend`: Express 5 API backed by MongoDB/Mongoose with JWT auth, refresh cookies, Cloudinary uploads, Resend email, comments, search analytics, and blog/project APIs.

## What The App Does

DevHub is built around one main publishing workflow:

1. A user signs up or logs in.
2. The backend returns an access token and sets a refresh-token cookie.
3. The user creates a blog or project in the writer composer.
4. The composer saves content as `draft` or `published`.
5. Published content appears in the home feed, public blog/project libraries, search, user profiles, and dashboard.
6. Other users can view, like, bookmark, comment, reply, and follow the author.
7. The dashboard aggregates author stats across blogs and projects.

Blogs and projects use the same MongoDB collection. A project is a `Blog` document where `contentType` is `"project"`. This keeps comments, likes, bookmarks, search, stats, and rendering logic shared.

## Feature Set

- Email/password signup and login.
- JWT access tokens plus HTTP-only refresh-token cookies.
- Email verification through 6-digit OTP.
- Forgot-password and reset-password flow.
- Profile editing with avatar, banner, bio, skills, social links, and portfolio.
- Follow/unfollow public users.
- Blog/project composer with markdown snippets, headings, quotes, lists, code blocks, links, images, cover uploads, undo, redo, drafts, and publishing.
- Public blog and project detail pages with rendered markdown, external links, images, code blocks, comments, likes, bookmarks, and view tracking.
- Dashboard showing profile stats, drafts, published blogs, published projects, edit/delete/status controls, and content type conversion.
- Public home feed with latest and trending blogs/projects.
- Public user profile with author content and follow state.
- Bookmark library.
- Search page with query search, suggestions, trending searches, recent searches, click tracking, and rate limiting.
- Responsive sidebar with persisted desktop open/collapsed state.

## Tech Stack

### Frontend

- Next.js `16.2.6`
- React `19.2.4`
- Redux Toolkit and React Redux
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Lucide React
- React Toastify
- CSS Modules

### Backend

- Node.js
- Express `5.2.1`
- MongoDB
- Mongoose `9`
- JSON Web Tokens
- bcryptjs
- cookie-parser
- cors
- Multer
- Cloudinary
- Resend
- Zod

## Folder Structure

```text
hacksprints/
  README.md
  backend/
    index.js
    seed.js
    package.json
    scripts/
      reindexBlogs.js
    src/
      app.js
      config/
        cloudinary.js
        db.js
        env.js
      controllers/
        auth.controller.js
        blog.controller.js
        comment.controller.js
        search.controller.js
        user.controller.js
      middleware/
        auth.middleware.js
        errorHandler.js
        optionalAuth.middleware.js
        rateLimit.middleware.js
        upload.middleware.js
        validate.js
      models/
        blog.model.js
        Blog.js
        comment.model.js
        searchLog.model.js
        user.model.js
      routes/
        auth.routes.js
        blog.routes.js
        protected.routes.js
        search.routes.js
        user.routes.js
      services/
        auth.service.js
        blog.service.js
        comment.service.js
        mail.service.js
        search.service.js
        searchAnalytics.service.js
        searchSync.service.js
        upload.service.js
        user.service.js
      utils/
        ApiResponse.js
        apiError.js
        asyncHandler.js
        buildSearchFilters.js
        buildSearchPipeline.js
        buildSearchSort.js
        cookies.js
        normalizeQuery.js
        normalizeSearchQuery.js
        sanitizeSearchInput.js
        slugify.js
        tokens.js
      validators/
        blog.validator.js
  frontend/
    package.json
    next.config.mjs
    src/
      app/
      assets/
      core/
      features/
      shared/
```

## Runtime Architecture

The frontend talks to the backend through `frontend/src/core/api/apiClient.js`.

- Default API URL: `http://localhost:5000/api`
- Override with: `NEXT_PUBLIC_API_URL`
- Axios sends credentials with `withCredentials: true`.
- Access tokens are attached through the API auth bootstrap.
- A failed authenticated request can trigger `/auth/refresh`, receive a new access token, and retry.

The backend is assembled in `backend/src/app.js`.

- `cookie-parser` reads refresh cookies.
- `cors` handles frontend access.
- Express JSON and URL-encoded parsers handle request bodies.
- Routes mount under `/api/auth`, `/api/blogs`, `/api/projects`, `/api/search`, `/api/users`, and `/api/protected`.
- `errorHandler` normalizes thrown errors into API responses.

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hacksprints
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=replace-with-a-long-access-secret
JWT_REFRESH_SECRET=replace-with-a-long-refresh-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=DevHub <hello@yourdomain.com>

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Additional backend variables are supported in `backend/src/config/env.js`:

```env
TYPESENSE_HOST=
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_ADMIN_API_KEY=
REDIS_URL=
```

Create `frontend/.env.local` when the backend URL is not the default:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
Health:   http://localhost:5000/health
```

## Scripts

Backend scripts:

```bash
npm run dev                    # Start Express with node --watch
npm run start                  # Start Express normally
npm run seed                   # Seed sample blog content
npm run reindex:blogs          # Sync MongoDB blog indexes
npm run sync:blog-search-index # Alias for reindex:blogs
```

Frontend scripts:

```bash
npm run dev    # Start Next.js dev server
npm run build  # Build production frontend
npm run start  # Start production frontend
npm run lint   # Run ESLint
```

## End-To-End Flows

### Signup Flow

1. User opens `/signup`.
2. `AuthForm` validates name, email, and password with Zod.
3. Frontend calls `POST /api/auth/signup`.
4. Backend validates the body and accepts an optional profile picture upload.
5. `auth.service.js` creates a `User`.
6. The password is hashed by the Mongoose `pre("save")` hook.
7. Backend creates an access token and refresh token.
8. Refresh token is hashed and stored on the user document.
9. Refresh token is sent as an HTTP-only cookie.
10. Access token and user payload are returned to Redux auth state.
11. The app redirects to `/dashboard`.

### Login Flow

1. User opens `/login`.
2. Frontend calls `POST /api/auth/login`.
3. Backend finds the user by email and compares the password with bcrypt.
4. Backend issues a new access token and refresh token.
5. Refresh token hash is saved on the user document.
6. Refresh cookie is set.
7. Frontend stores the access token and current user in Redux.

### Refresh Token Flow

1. Axios receives a `401` from a protected route.
2. The response interceptor calls `POST /api/auth/refresh`.
3. Backend reads `refreshToken` from cookies.
4. Backend verifies the JWT and compares it against the stored refresh token hash.
5. Backend returns a fresh access token.
6. Axios retries the original request with the new token.

### Email Verification Flow

1. Authenticated user requests or receives an OTP.
2. Backend hashes the OTP and stores `emailVerificationOtpHash`.
3. Expiration is stored in `emailVerificationOtpExpiresAt`.
4. Email is sent through Resend when configured.
5. User submits OTP to `POST /api/auth/verify-email`.
6. Backend compares the OTP and marks `isEmailVerified` as `true`.

### Forgot/Reset Password Flow

1. User submits email on `/forgot-password`.
2. Backend creates a random reset token.
3. Backend stores `passwordResetTokenHash` and `passwordResetExpiresAt`.
4. Reset URL is emailed through Resend.
5. User submits token and new password on `/reset-password`.
6. Backend hashes the provided token, finds the matching user, updates password, and clears reset fields.

### Blog Or Project Creation Flow

1. User opens `/write/new` for blogs or `/projects/new` for projects.
2. `BlogComposerPage` uses `useBlogComposer`.
3. The user writes title, subheading, category, tags, markdown body, cover image, and inline images.
4. Composer can insert markdown snippets:
   - Paragraph
   - Heading
   - Subheading
   - Quote
   - List
   - Code
   - Link
   - Inline image
5. User clicks `Save draft` or `Publish`.
6. Frontend creates `FormData` and calls `/api/blogs` or `/api/projects`.
7. Backend sets `contentType` based on route:
   - `/api/blogs` creates `contentType: "blog"`
   - `/api/projects` creates `contentType: "project"`
8. Backend generates a unique slug from the title.
9. Cover image uploads to Cloudinary when configured.
10. Backend calculates read time and excerpt.
11. Blog/project document is saved.
12. Frontend redirects to `/dashboard`.

### Dashboard Flow

1. User opens `/dashboard`.
2. `useDashboardPage` calls `useUserBlogs` with `contentType: "all"`.
3. Backend returns all authored blogs and projects, including drafts.
4. Dashboard maps documents into cards.
5. Dashboard stats show:
   - total posts
   - published blogs
   - published projects
   - drafts
   - followers/following
   - total views
   - total likes
6. User can:
   - open a published item
   - preview a draft
   - edit
   - publish/unpublish
   - convert blog to project or project to blog
   - delete

### Public Detail Flow

1. User opens `/blogs/[id]` or `/projects/[id]`.
2. Frontend calls public detail endpoint.
3. Backend only returns published content for public reads.
4. If viewing a project and public read fails, frontend falls back to the authenticated owner endpoint.
5. Detail page renders markdown into headings, paragraphs, lists, quotes, code blocks, images, and links.
6. Non-preview detail pages increment views.
7. Authenticated users can like, bookmark, and comment.

### Comment Flow

1. User opens a detail page.
2. Frontend loads comments from `GET /:id/comments`.
3. Authenticated user submits a comment or reply.
4. Backend creates a `Comment`.
5. Reply comments store `parentComment`, `rootComment`, and `depth`.
6. Backend increments comment or reply counts.
7. Users can like comments.

### Bookmark Flow

1. Authenticated user clicks bookmark.
2. Frontend calls `PATCH /blogs/:id/bookmark` or `PATCH /projects/:id/bookmark`.
3. Backend adds or removes user id in `bookmarkedBy`.
4. `/bookmarks` fetches all published content bookmarked by the user.

### Search Flow

1. User opens `/search`.
2. Search calls `/api/search/blogs` with query and filters.
3. Backend sanitizes query input.
4. Search service builds Mongo search filters and sorting.
5. Search logs capture query, result count, source, clicked blog, and position.
6. Suggestions, recent searches, and trending searches are powered by search logs.

### Profile Flow

1. User edits profile in dashboard.
2. Frontend sends `FormData` to `PATCH /api/users/me`.
3. Backend validates profile text, social links, skills, portfolio, avatar, and banner.
4. Avatar/banner upload to Cloudinary when configured.
5. Public user profile shows bio, skills, social links, portfolio, follow button, stats, and published work.

## API Reference

Base URL:

```text
http://localhost:5000/api
```

### Auth Routes

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Create user, optional avatar upload, issue tokens |
| `POST` | `/auth/login` | Public | Login and issue tokens |
| `POST` | `/auth/refresh` | Cookie | Rotate access token from refresh cookie |
| `POST` | `/auth/logout` | Cookie | Clear refresh token |
| `GET` | `/auth/me` | Required | Return current user |
| `POST` | `/auth/verify-email` | Required | Verify 6-digit OTP |
| `POST` | `/auth/resend-verification-otp` | Required | Send another OTP |
| `POST` | `/auth/forgot-password` | Public | Create reset token and email link |
| `POST` | `/auth/reset-password` | Public | Reset password with token |

### Blog Routes

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/blogs` | Optional | List published blogs |
| `POST` | `/blogs` | Required | Create blog |
| `GET` | `/blogs/me` | Required | List current user's blogs |
| `GET` | `/blogs/me/:id` | Required | Get owned blog, including drafts |
| `GET` | `/blogs/bookmarks` | Required | List bookmarked blogs |
| `GET` | `/blogs/user/:userId` | Optional | List user's published blogs |
| `GET` | `/blogs/:slugOrId` | Optional | Get published blog by slug or id |
| `PATCH` | `/blogs/:id` | Required | Update owned blog |
| `DELETE` | `/blogs/:id` | Required | Delete owned blog |
| `PATCH` | `/blogs/:id/view` | Public | Increment views |
| `GET` | `/blogs/:id/social` | Optional | Get like/bookmark state |
| `PATCH` | `/blogs/:id/content-type` | Required | Convert blog/project |
| `PATCH` | `/blogs/:id/like` | Required | Like or unlike |
| `PATCH` | `/blogs/:id/bookmark` | Required | Bookmark or unbookmark |
| `GET` | `/blogs/:id/comments` | Optional | List comments |
| `POST` | `/blogs/:id/comments` | Required | Create comment or reply |
| `PATCH` | `/blogs/:id/comments/:commentId/like` | Required | Like or unlike comment |

### Project Routes

Project routes mirror blog routes under `/projects`. The route middleware marks these requests with `contentType: "project"`.

Examples:

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/projects` | Optional | List published projects |
| `POST` | `/projects` | Required | Create project |
| `GET` | `/projects/me` | Required | List current user's projects |
| `GET` | `/projects/me/:id` | Required | Get owned project, including drafts |
| `GET` | `/projects/:id` | Optional | Get published project |
| `PATCH` | `/projects/:id` | Required | Update owned project |
| `DELETE` | `/projects/:id` | Required | Delete owned project |

### Search Routes

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/search/blogs` | Optional | Search published content |
| `GET` | `/search/suggestions` | Optional | Autocomplete suggestions |
| `GET` | `/search/trending` | Optional | Trending queries |
| `GET` | `/search/recent` | Optional | User recent searches |
| `DELETE` | `/search/recent` | Optional | Clear recent searches |
| `POST` | `/search/click` | Optional | Track result click |

### User Routes

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `PATCH` | `/users/me` | Required | Update profile |
| `GET` | `/users/:userId/follow-status` | Optional | Get follow state/counts |
| `POST` | `/users/:userId/follow` | Required | Follow user |
| `DELETE` | `/users/:userId/follow` | Required | Unfollow user |

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Home feed |
| `/blogs` | Public blog library |
| `/blogs/[id]` | Blog detail |
| `/projects` | Public project library |
| `/projects/[id]` | Project detail |
| `/projects/new` | Create project |
| `/projects/edit/[id]` | Edit project |
| `/projects/preview/[id]` | Preview owned project |
| `/dashboard` | Author dashboard |
| `/write` | Writer blog library |
| `/write/new` | Create blog |
| `/write/edit/[id]` | Edit blog |
| `/write/preview/[id]` | Preview owned blog |
| `/write/drafts` | Draft list |
| `/write/projects/new` | Alternate create-project route |
| `/bookmarks` | User bookmarks |
| `/search` | Search UI |
| `/users/[id]` | Public profile |
| `/login` | Login |
| `/signup` | Signup |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/terms` | Terms |
| `/privacy` | Privacy |

## Database Schema

The backend uses MongoDB with Mongoose models in `backend/src/models`.

### `users` Collection

Model: `User`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `name` | `String` | Yes | none | Trimmed, 2-80 chars |
| `username` | `String` | No | none | Lowercase, trimmed, 3-32 chars, sparse unique |
| `email` | `String` | Yes | none | Lowercase, trimmed, unique, indexed |
| `avatar` | `String` | No | `""` | Profile image URL |
| `banner` | `String` | No | `""` | Profile banner URL |
| `bio` | `String` | No | `""` | Max 180 chars |
| `skills` | `[String]` | No | `[]` | Public skill badges |
| `socialLinks.github` | `String` | No | `""` | URL |
| `socialLinks.linkedin` | `String` | No | `""` | URL |
| `socialLinks.website` | `String` | No | `""` | URL |
| `socialLinks.twitter` | `String` | No | `""` | URL |
| `portfolio[].title` | `String` | No | none | Max 80 chars |
| `portfolio[].description` | `String` | No | none | Max 160 chars |
| `portfolio[].url` | `String` | No | none | Max 300 chars |
| `password` | `String` | Yes | none | Min 8 chars, hashed, `select: false` |
| `refreshTokenHash` | `String` | No | `null` | Hashed refresh token, `select: false` |
| `isEmailVerified` | `Boolean` | No | `false` | Email OTP status |
| `followers` | `[ObjectId<User>]` | No | `[]` | Users following this user |
| `following` | `[ObjectId<User>]` | No | `[]` | Users this user follows |
| `emailVerificationOtpHash` | `String` | No | `null` | Hashed OTP, `select: false` |
| `emailVerificationOtpExpiresAt` | `Date` | No | `null` | OTP expiration, `select: false` |
| `passwordResetTokenHash` | `String` | No | `null` | Hashed reset token, `select: false` |
| `passwordResetExpiresAt` | `Date` | No | `null` | Reset expiration, `select: false` |
| `createdAt` | `Date` | Auto | auto | From timestamps |
| `updatedAt` | `Date` | Auto | auto | From timestamps |

User indexes:

- `{ email: 1 }`
- unique sparse username index from schema
- `{ followers: 1 }`
- `{ following: 1 }`

User hooks and methods:

- `pre("save")`: hashes modified passwords with bcrypt.
- `comparePassword(candidatePassword)`: compares password.
- `compareRefreshToken(token)`: compares refresh token.
- `setRefreshToken(token)`: stores hashed refresh token.
- `setEmailVerificationOtp(otp)`: stores OTP hash and expiration.
- `compareEmailVerificationOtp(otp)`: compares OTP.
- `createPasswordResetToken()`: returns raw reset token and stores hash.
- `hashPasswordResetToken(token)`: static helper for reset lookup.

### `blogs` Collection

Model: `Blog`

This collection stores both blogs and projects.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | `String` | Yes | none | Trimmed, indexed |
| `slug` | `String` | Yes | none | Unique, lowercase, indexed |
| `heading` | `String` | Yes | none | Trimmed |
| `subheading` | `String` | Yes | none | Trimmed |
| `content` | `String` | Yes | none | Markdown content |
| `excerpt` | `String` | No | `""` | Generated from content |
| `coverImage.url` | `String` | No | `""` | Cloudinary URL |
| `coverImage.publicId` | `String` | No | `""` | Cloudinary public id |
| `tags` | `[String]` | No | `[]` | Indexed |
| `category` | `String` | Yes | none | Trimmed, indexed |
| `contentType` | `"blog" | "project"` | No | `"blog"` | Indexed |
| `author` | `ObjectId<User>` | Yes | none | Indexed |
| `status` | `"draft" | "published"` | No | `"published"` | Indexed |
| `readTime` | `Number` | No | `1` | Calculated from word count |
| `views` | `Number` | No | `0` | Incremented on public detail view |
| `likesCount` | `Number` | No | `0` | Denormalized count |
| `likedBy` | `[ObjectId<User>]` | No | `[]` | `select: false` |
| `bookmarkedBy` | `[ObjectId<User>]` | No | `[]` | `select: false` |
| `commentsCount` | `Number` | No | `0` | Denormalized count |
| `isFeatured` | `Boolean` | No | `false` | Optional promotion flag |
| `createdAt` | `Date` | Auto | auto | From timestamps |
| `updatedAt` | `Date` | Auto | auto | From timestamps |

Blog indexes:

- Text index `BlogSearchIndex` over:
  - `title`
  - `heading`
  - `subheading`
  - `excerpt`
  - `content`
  - `tags`
  - `category`
  - `contentType`
- Text weights:
  - `title`: 12
  - `tags`: 10
  - `category`: 8
  - `heading`: 6
  - `subheading`: 5
  - `excerpt`: 4
  - `contentType`: 3
  - `content`: 1
- `{ createdAt: -1 }`
- `{ views: -1 }`
- `{ category: 1, status: 1 }`
- `{ contentType: 1, status: 1, createdAt: -1 }`
- `{ author: 1, createdAt: -1 }`
- `{ likedBy: 1 }`
- `{ bookmarkedBy: 1 }`

### `comments` Collection

Model: `Comment`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `blog` | `ObjectId<Blog>` | Yes | none | Indexed |
| `author` | `ObjectId<User>` | Yes | none | Indexed |
| `body` | `String` | Yes | none | Trimmed, 1-1000 chars |
| `parentComment` | `ObjectId<Comment>` | No | `null` | Parent reply, indexed |
| `rootComment` | `ObjectId<Comment>` | No | `null` | Root thread, indexed |
| `depth` | `Number` | No | `0` | Min 0, max 3 |
| `repliesCount` | `Number` | No | `0` | Denormalized count |
| `likesCount` | `Number` | No | `0` | Denormalized count |
| `likedBy` | `[ObjectId<User>]` | No | `[]` | `select: false` |
| `createdAt` | `Date` | Auto | auto | From timestamps |
| `updatedAt` | `Date` | Auto | auto | From timestamps |

Comment indexes:

- `{ blog: 1, createdAt: -1 }`
- `{ blog: 1, parentComment: 1, createdAt: 1 }`
- `{ likedBy: 1 }`

### `searchlogs` Collection

Model: `SearchLog`

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `query` | `String` | No | none | Trimmed, max 100 |
| `user` | `ObjectId<User>` | No | none | Optional authenticated user |
| `resultCount` | `Number` | No | `0` | Number of returned results |
| `clickedSlug` | `String` | No | none | Clicked result slug |
| `blog` | `ObjectId<Blog>` | No | none | Clicked/searched content |
| `position` | `Number` | No | `null` | Click position |
| `source` | `"search" | "autocomplete" | "trending" | "recent"` | No | `"search"` | Search source |
| `createdAt` | `Date` | Auto | auto | From timestamps |
| `updatedAt` | `Date` | Auto | auto | From timestamps |

SearchLog indexes:

- `{ query: 1, createdAt: -1 }`
- `{ user: 1, createdAt: -1 }`

## Important Backend Services

### `auth.service.js`

Owns signup, login, token refresh, logout, current-user loading, email verification, OTP resend, forgot-password, and reset-password business logic.

### `blog.service.js`

Owns blog/project creation, listing, detail loading, owner loading, updates, deletion, views, likes, bookmarks, content-type conversion, stats, slug generation, read time, excerpts, and viewer state.

### `comment.service.js`

Owns comment listing, nested replies, creating comments/replies, reply counters, comment likes, and comment count synchronization.

### `search.service.js`

Owns searching blogs/projects, suggestions, recent queries, trending queries, click tracking, and search log integration.

### `user.service.js`

Owns profile updates, social links, skills, portfolio parsing, avatar/banner uploads, follow/unfollow, and follow status.

### `upload.service.js`

Uploads images to Cloudinary when credentials exist. Also handles image cleanup for replaced/deleted assets.

### `mail.service.js`

Sends transactional emails through Resend when configured. Used by verification and password reset flows.

## Validation Rules

Auth routes validate request bodies with Zod:

- Signup: `name`, `email`, `password`
- Login: `email`, `password`
- Verify email: six digit `otp`
- Forgot password: `email`, optional `clientUrl`
- Reset password: `token`, `password`

Blog/project routes validate:

- `title`: required
- `heading`: required
- `subheading`: required
- `content`: required
- `category`: required
- `tags`: comma/space-separated or array input, normalized to unique lowercase tags
- `status`: `draft` or `published`
- `isFeatured`: boolean-like input

## Authentication And Cookies

Access token:

- Sent in API responses.
- Stored in frontend auth state.
- Attached as `Authorization: Bearer <token>` by Axios.

Refresh token:

- Stored as an HTTP-only cookie named `refreshToken`.
- Cookie path: `/api/auth`.
- Cookie `sameSite`: `"none"`.
- Cookie `secure`: `true` only when `NODE_ENV === "production"`.
- Server stores only the hashed refresh token.

Note: The backend currently uses CORS `origin: "*"` with `credentials: true`. Browsers generally reject credentialed cookie requests with wildcard origins. For cookie-based auth in production, use an explicit frontend origin.

## Search And Indexing

MongoDB text search is backed by `BlogSearchIndex` on the `blogs` collection.

Run this after changing blog indexes:

```bash
cd backend
npm run reindex:blogs
```

That script calls `Blog.syncIndexes()` and prints dropped/active indexes.

Search analytics are stored in `SearchLog`, allowing:

- Recent searches
- Trending searches
- Autocomplete suggestions
- Click tracking
- Source attribution

## Upload Behavior

Supported upload areas:

- Signup profile picture
- Profile avatar
- Profile banner
- Blog/project cover image
- Inline markdown images

When Cloudinary credentials are missing, upload behavior depends on the upload service fallback/error path. Configure Cloudinary for real hosted images.

## Deployment Notes

Backend:

- Set `NODE_ENV=production`.
- Use a hosted MongoDB URI.
- Use long random JWT secrets.
- Configure Cloudinary credentials.
- Configure Resend sender and API key.
- Use an explicit CORS origin if relying on cookies.
- Serve over HTTPS when using `sameSite: "none"` cookies.

Frontend:

- Set `NEXT_PUBLIC_API_URL` to the deployed backend API.
- Build with `npm run build`.
- Start with `npm run start` or deploy to a Next.js host.

## Verification

Recommended checks:

```bash
cd backend
node --check src/app.js
node --check src/services/blog.service.js
node --check src/routes/blog.routes.js

cd ../frontend
npm run lint
npm run build
```

## Troubleshooting

### Cookies are not being saved

Check:

- Backend CORS origin should be explicit when using credentials.
- Frontend Axios must use `withCredentials: true`.
- `sameSite: "none"` requires secure HTTPS cookies in production browsers.
- Cookie path is `/api/auth`, so refresh/logout must use auth routes.

### Project shows as missing

Projects are `Blog` documents with `contentType: "project"`. Check:

- The document exists in `blogs`.
- `contentType` is `"project"`.
- Public project detail requires `status: "published"`.
- Owner preview uses `/projects/me/:id`.
- Dashboard uses `contentType=all` for authored content.

### Search results are stale or weak

Run:

```bash
cd backend
npm run reindex:blogs
```

Also check the `BlogSearchIndex` text weights in `backend/src/models/blog.model.js`.

### Images do not appear

Check:

- Cloudinary env vars are set.
- Uploaded document has `coverImage.url`.
- Inline markdown image URLs are valid.
- Browser console/network tabs for failed image URLs.

## License

The backend package is marked `ISC` in `backend/package.json`.
