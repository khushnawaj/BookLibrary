# BookVerse — Postman / cURL Test Guide

## Setup

1. Start server: `npm run dev` (from `server/`)
2. Register or login to get auth cookies
3. Use `-b cookies.txt -c cookies.txt` with cURL, or import requests into Postman

**Variables:**
```
BASE_URL = http://localhost:5000/api/v1
```

---

## Step 0 — Authenticate

### Register
```bash
curl -X POST {{BASE_URL}}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Reader",
    "username": "testreader",
    "email": "reader@bookverse.com",
    "password": "SecurePass1"
  }' \
  -c cookies.txt
```

### Login (if already registered)
```bash
curl -X POST {{BASE_URL}}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reader@bookverse.com","password":"SecurePass1"}' \
  -c cookies.txt
```

---

## Books Module

### 1. Create Book
```bash
curl -X POST {{BASE_URL}}/books \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Atomic Habits",
    "author": "James Clear",
    "genre": "Self-Help",
    "language": "English",
    "pages": 320,
    "description": "Tiny changes, remarkable results"
  }'
```
Save `_id` from response as `BOOK_ID`.

### 2. List Books (with search & filter)
```bash
curl "{{BASE_URL}}/books?page=1&limit=10&search=atomic&genre=Self-Help&sort=newest" \
  -b cookies.txt
```

### 3. Get Book by ID
```bash
curl {{BASE_URL}}/books/BOOK_ID -b cookies.txt
```

### 4. Update Book
```bash
curl -X PUT {{BASE_URL}}/books/BOOK_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"rating": null, "pages": 321, "description": "Updated description"}'
```
Note: use valid book fields only (`pages`, `description`, etc.).

```bash
curl -X PUT {{BASE_URL}}/books/BOOK_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"pages": 321, "description": "Updated description"}'
```

### 5. Delete Book
```bash
curl -X DELETE {{BASE_URL}}/books/BOOK_ID -b cookies.txt
```

---

## Library Module

### 1. Add to Library (Wishlist)
```bash
curl -X POST {{BASE_URL}}/library \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "book": "BOOK_ID",
    "shelfType": "WISHLIST"
  }'
```
Save `_id` as `LIBRARY_ID`.

### 2. Add to Reading Shelf
```bash
curl -X POST {{BASE_URL}}/library \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "book": "BOOK_ID",
    "shelfType": "READING",
    "startedAt": "2026-06-01T00:00:00.000Z"
  }'
```

### 3. List Library (filter by shelf)
```bash
curl "{{BASE_URL}}/library?shelfType=READING&page=1&limit=10&sort=newest" \
  -b cookies.txt
```

### 4. Get Library Entry
```bash
curl {{BASE_URL}}/library/LIBRARY_ID -b cookies.txt
```

### 5. Update Entry (mark as read + review)
```bash
curl -X PUT {{BASE_URL}}/library/LIBRARY_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "shelfType": "READ",
    "rating": 5,
    "review": "Excellent read!",
    "finishedAt": "2026-06-07T00:00:00.000Z"
  }'
```

### 6. Remove from Library
```bash
curl -X DELETE {{BASE_URL}}/library/LIBRARY_ID -b cookies.txt
```

---

## Error Test Cases

### Unauthorized (no cookie)
```bash
curl {{BASE_URL}}/books
# Expected: 401 Authentication required
```

### Invalid ObjectId
```bash
curl {{BASE_URL}}/books/invalid-id -b cookies.txt
# Expected: 422 Invalid book ID
```

### Duplicate library entry
```bash
# POST same book twice
curl -X POST {{BASE_URL}}/library \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"book":"BOOK_ID","shelfType":"WISHLIST"}'
# Expected: 409 This book is already in your library
```

### Validation error
```bash
curl -X POST {{BASE_URL}}/books \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"","author":""}'
# Expected: 422 Validation failed
```

---

## Postman Collection Tips

| Setting | Value |
|---------|-------|
| Authorization | Inherit from parent, or use cookies |
| Credentials | Enable "Automatically follow redirects" + cookie jar |
| Tests tab | `pm.test("Success", () => pm.response.json().success === true)` |

Create environment variables: `baseUrl`, `bookId`, `libraryId` and set them from test scripts after create responses.
