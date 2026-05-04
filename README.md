# GetVeriSight

Next.js foundation for a moderation platform with JWT authentication and room for image, video, and text moderation modules.

## Current stack

- Next.js App Router
- TypeScript
- MongoDB with Mongoose
- JWT authentication in HTTP-only cookies
- Bcrypt password hashing
- Google sign-in that issues the same app JWT cookie

## Project structure

```text
src
|- app
|  |- (auth)
|  |  |- forgot-password/page.tsx
|  |  |- login/page.tsx
|  |  |- reset-password/page.tsx
|  |  `- signup/page.tsx
|  |- (dashboard)
|  |  `- dashboard/page.tsx
|  |- api/auth
|  |  |- forgot-password/route.ts
|  |  |- google/route.ts
|  |  |- login/route.ts
|  |  |- logout/route.ts
|  |  |- me/route.ts
|  |  |- reset-password/route.ts
|  |  `- signup/route.ts
|  |- globals.css
|  |- layout.tsx
|  `- page.tsx
|- components
|  |- auth
|  `- layout
|- lib
|  |- moderation
|  |  |- image/service.ts
|  |  |- text/service.ts
|  |  `- video/service.ts
|  |- validators/auth.ts
|  |- constants/auth.ts
|  |- auth.ts
|  |- db.ts
|  |- env.ts
|  |- flash-message.ts
|  |- google.ts
|  |- jwt.ts
|  `- password.ts
|- models
|  `- User.ts
|- types
|  `- auth.ts
`- middleware.ts
```

## Environment setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI`.
3. Set a long random `JWT_SECRET`.
4. Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if you want Google sign-in.
5. Install dependencies with `npm install`.
6. Run the dev server with `npm run dev`.

## Authentication flow

1. User signs up or logs in through the auth page.
2. Route handler validates input with Zod.
3. Password is hashed with bcrypt on signup and compared on login.
4. A JWT is created with the user id and email.
5. The JWT is stored in a secure HTTP-only cookie.
6. Middleware protects dashboard routes.
7. Server components and API routes can read the current user through `getAuthUser()`.

## Google sign-in flow

1. The browser renders the Google Identity Services button.
2. Google returns an ID token credential to the client.
3. The client sends that credential to `/api/auth/google`.
4. The backend verifies the token with `google-auth-library`.
5. The app finds or creates the MongoDB user.
6. The app issues the same JWT cookie used by email/password login.

## Password reset flow

1. The user opens `/forgot-password` and submits an email address.
2. The app creates a secure reset token and stores only its hash in MongoDB.
3. A reset link is generated for `/reset-password?token=...`.
4. The reset page posts the token and new password to `/api/auth/reset-password`.
5. The app validates the token, updates the password hash, and clears the reset token.
