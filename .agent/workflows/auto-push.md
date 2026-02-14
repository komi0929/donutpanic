---
description: How to auto-push code changes to GitHub after editing donutpanic files
---

# Auto Push Workflow

// turbo-all

After making any code changes in the donutpanic project, always run the following:

1. Stage and commit all changes with a descriptive message:
```bash
cd "c:\Users\soyst\OneDrive\デスクトップ\donutpanic" && git add -A && git commit -m "<descriptive message>"
```

2. Push to GitHub:
```bash
cd "c:\Users\soyst\OneDrive\デスクトップ\donutpanic" && git push
```

This ensures Vercel auto-deploys the latest changes.
