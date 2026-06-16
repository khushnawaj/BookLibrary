# BookVerse — Authentication API Contract

Base URL: `/api/v1/auth`

All responses follow:

```json
{ "success": boolean, "message": string, "data"?: object, "errors"?: array }
```

Cookies are set on register/login (HttpOnly). Send cookies with subsequent requests (`credentials: include`).

---

## POST `/register`

Create a new user account and issue auth tokens.

### Request Body

```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | Required, 2–100 characters |
| `username` | Required, 3–30 chars, `[a-zA-Z0-9_]`, unique, stored lowercase |
| `email` | Required, valid email, unique |
| `password` | Required, min 8 chars, 1 uppercase, 1 number |

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": null,
      "bio": "",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-06-07T10:00:00.000Z",
      "updatedAt": "2026-06-07T10:00:00.000Z"
    }
  }
}
```

**Cookies set:** `accessToken` (15m), `refreshToken` (7d)

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `422` | Validation failed | `{ "success": false, "message": "Validation failed", "errors": [{ "field": "password", "message": "..." }] }` |
| `409` | Email/username taken | `{ "success": false, "message": "Email is already registered" }` |

---

## POST `/login`

Authenticate existing user and issue auth tokens.

### Request Body

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `email` | Required, valid email |
| `password` | Required |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": null,
      "bio": "",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-06-07T10:00:00.000Z",
      "updatedAt": "2026-06-07T10:00:00.000Z"
    }
  }
}
```

**Cookies set:** `accessToken`, `refreshToken`

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `422` | Validation failed | `{ "success": false, "message": "Validation failed", "errors": [...] }` |
| `401` | Wrong credentials | `{ "success": false, "message": "Invalid email or password" }` |

---

## POST `/logout`

Invalidate refresh token and clear auth cookies. **Requires authentication.**

### Request Body

None.

### Headers / Cookies

- Cookie: `accessToken` (required)
- Optional: `Authorization: Bearer <accessToken>`

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies cleared:** `accessToken`, `refreshToken`

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Missing/invalid token | `{ "success": false, "message": "Authentication required" }` |

---

## GET `/me`

Return the authenticated user's profile. **Requires authentication.**

### Request Body

None.

### Headers / Cookies

- Cookie: `accessToken` (required)
- Optional: `Authorization: Bearer <accessToken>`

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": null,
      "bio": "",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-06-07T10:00:00.000Z",
      "updatedAt": "2026-06-07T10:00:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Missing/invalid/expired token | `{ "success": false, "message": "Invalid or expired access token" }` |
| `404` | User deleted | `{ "success": false, "message": "User not found" }` |

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","username":"janedoe","email":"jane@example.com","password":"SecurePass1"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"SecurePass1"}' \
  -c cookies.txt

# Get current user
curl http://localhost:5000/api/v1/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:5000/api/v1/auth/logout -b cookies.txt
```
