---
name: Orval-generated mutation signatures
description: After codegen, mutations often take object params not bare primitives — always check generated types
---
After running orval codegen, check the generated mutation signatures. For example, removeFavorite.mutate() takes {experienceId: number}, not just a number. This differs from what you might intuitively write.

**Why:** Orval generates strictly typed mutation variables from the OpenAPI path params. If the spec has /favorites/{experienceId}, the generated mutate() takes {experienceId: number}.

**How to apply:** After any codegen run, if TypeScript errors appear on .mutate() calls, check lib/api-client-react/src/generated/api.ts for the actual UseMutationResult variable type.
