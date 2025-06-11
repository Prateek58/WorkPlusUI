# API URL Fix for 404 Error

## Problem
After fixing the CORS issue, the login request was returning a 404 (Not Found) error:
```
POST https://api.workplus.layerbiz.com/Auth/login 404 (Not Found)
```

## Root Cause
The production API URL configuration was missing the `/api` prefix:
- **Before**: `https://api.workplus.layerbiz.com/Auth/login` ❌
- **After**: `https://api.workplus.layerbiz.com/api/Auth/login` ✅

The backend API controller expects routes to be prefixed with `/api` as defined in the route attribute: `[Route("api/[controller]")]`

## Solution
Updated the frontend API URL configuration to include the `/api` prefix in production.

## Changes Made

### 1. src/Code/Common/config.ts
```typescript
export const API_URL = isProduction 
  ? 'https://api.workplus.layerbiz.com/api'  // Added /api suffix
  : 'https://localhost:7160/api';
```

### 2. src/Code/Common/services/apiConfig.ts
```typescript
export const API_URL = isProduction 
  ? 'https://api.workplus.layerbiz.com/api'  // Added /api suffix
  : 'https://localhost:7160/api';
```

## Result
Now all API calls in production will correctly route to:
- Login: `https://api.workplus.layerbiz.com/api/Auth/login`
- Register: `https://api.workplus.layerbiz.com/api/Auth/register`
- Other endpoints: `https://api.workplus.layerbiz.com/api/{controller}/{action}`

## Deployment
After deploying the updated frontend files, the login functionality should work correctly without 404 errors. 