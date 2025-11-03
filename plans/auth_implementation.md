# Authentication System Implementation Plan

**Date:** 2025-11-03
**Status:** Approved - Ready for Implementation

---

## Current State
- JWT authentication infrastructure is already configured (`djangorestframework-simplejwt`)
- Axios interceptor automatically adds JWT Bearer token to requests
- Django User model is in use
- Navbar exists but login/signup buttons are hidden

---

## BACKEND IMPLEMENTATION (Django + DRF)

### 1. Authentication Endpoints (`backend/apps/users/`)

#### Files to create/modify:

**`apps/users/serializers.py`**
- `UserRegistrationSerializer` - handle user signup (username, email, password, password confirmation)
- `UserLoginSerializer` - validate login credentials
- `UserSerializer` - public user data (exclude sensitive fields)
- `UserProfileSerializer` - detailed user profile (editable fields)

**`apps/users/services.py`** (Business Logic - HackSoft pattern)
- `register_user(*, email: str, username: str, password: str) -> User` - create new user with hashed password
- `authenticate_user(*, username: str, password: str) -> User | None` - validate credentials
- `update_user_profile(*, user: User, **kwargs) -> User` - update profile fields

**`apps/users/selectors.py`** (Query Logic - HackSoft pattern)
- `get_user_by_id(*, user_id: int) -> User` - fetch user by ID
- `get_user_by_username(*, username: str) -> User | None` - find user by username
- `get_user_by_email(*, email: str) -> User | None` - find user by email

**`apps/users/views.py`**
- `RegisterView(APIView)` - POST `/api/auth/register/`
- `LoginView` - POST `/api/auth/login/` - returns JWT tokens
- `LogoutView(APIView)` - POST `/api/auth/logout/` - blacklist refresh token
- `CurrentUserView(APIView)` - GET `/api/auth/me/` - returns authenticated user info
- `UserProfileView(APIView)` - GET/PATCH `/api/auth/profile/` - view/update profile

**`apps/users/urls.py`**
```python
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
```

**`config/urls.py`**
- Add: `path("api/auth/", include("apps.users.urls"))`

**`config/settings/base.py`**
- Add `SIMPLE_JWT` configuration
- Enable token blacklist app

### 2. Comprehensive Tests (`backend/tests/test_auth.py`)
- User registration (success, validation errors, duplicate username/email)
- Login (success, invalid credentials)
- Token refresh
- Logout and token blacklist
- Protected endpoint access (with/without token)
- Profile retrieval and updates
- Permission checks (owner-only updates)

---

## FRONTEND IMPLEMENTATION (React + TypeScript)

### 1. Authentication Hook (`frontend/src/hooks/useAuth.ts`)
- Custom hook using React Query
- State: user, isAuthenticated, isLoading
- Functions: login(), logout(), register(), refetchUser()

### 2. Update Navbar (`frontend/src/components/Navbar.tsx`)
**Logged Out:** Show "Login" and "Sign Up" buttons
**Logged In:** Show user avatar with dropdown (Profile, Settings, Logout)

### 3. Authentication Pages
- **`frontend/src/pages/Login.tsx`** - Login form
- **`frontend/src/pages/Signup.tsx`** - Registration form
- **`frontend/src/pages/Profile.tsx`** - User profile view/edit
- **`frontend/src/pages/Settings.tsx`** - User settings

### 4. Protected Routes (`frontend/src/router.tsx`)
- Add authentication guard
- Redirect to `/login` if not authenticated
- New routes: `/login`, `/signup`, `/dashboard/profile`, `/dashboard/settings`

### 5. API Integration (`frontend/src/lib/api.ts`)
- Add auth API helpers
- Implement token refresh logic
- Handle 401 responses

---

## SUMMARY OF FILES

### Backend (New/Modified)
1. ✅ `backend/apps/users/serializers.py` (new)
2. ✅ `backend/apps/users/services.py` (new)
3. ✅ `backend/apps/users/selectors.py` (new)
4. ✅ `backend/apps/users/views.py` (new)
5. ✅ `backend/apps/users/urls.py` (new)
6. ✅ `backend/config/urls.py` (modified)
7. ✅ `backend/config/settings/base.py` (modified)
8. ✅ `backend/tests/test_auth.py` (new)

### Frontend (New/Modified)
1. ✅ `frontend/src/hooks/useAuth.ts` (new)
2. ✅ `frontend/src/components/Navbar.tsx` (modified)
3. ✅ `frontend/src/pages/Login.tsx` (new)
4. ✅ `frontend/src/pages/Signup.tsx` (new)
5. ✅ `frontend/src/pages/Profile.tsx` (new)
6. ✅ `frontend/src/pages/Settings.tsx` (new)
7. ✅ `frontend/src/router.tsx` (modified)
8. ✅ `frontend/src/lib/api.ts` (modified)

---

## Testing Coverage
- User registration (valid, invalid, duplicate)
- Login (valid credentials, invalid credentials)
- Token refresh
- Logout and token blacklist
- Protected endpoint access
- Profile retrieval and updates
- Permission checks
