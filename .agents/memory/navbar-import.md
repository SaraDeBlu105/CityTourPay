---
name: Navbar relative import path
description: Navbar is at src/components/layout/ so AuthContext needs ../../contexts/AuthContext not ../contexts/AuthContext
---
The Navbar component lives at artifacts/city-tour-italy/src/components/layout/Navbar.tsx. AuthContext is at src/contexts/AuthContext.tsx. The correct relative import is ../../contexts/AuthContext (two levels up), not ../contexts/AuthContext.

**Why:** The layout/ subdirectory adds one level of depth that is easy to miss when writing relative imports.

**How to apply:** Always use ../../contexts/AuthContext from any file in src/components/layout/.
