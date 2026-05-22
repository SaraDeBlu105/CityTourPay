---
name: Admin auth pattern
description: isAdmin stored in JWT payload; requireAdmin middleware in auth.ts; grant admin via SQL
---
Admin authentication: isAdmin boolean is in the usersTable schema and included in the JWT payload at sign-in. The requireAdmin middleware verifies the token and checks payload.isAdmin. To grant admin: `UPDATE users SET is_admin = true WHERE email = '...'` then user must re-login for new JWT.

**Why:** JWT-based auth means the isAdmin flag is baked into the token. Old tokens without isAdmin will be treated as non-admin (payload.isAdmin === undefined is falsy). Re-login is required after granting admin.

**How to apply:** Use requireAdmin middleware on all /admin/* routes. Frontend reads user.isAdmin from the /auth/me response to show/hide admin UI.
