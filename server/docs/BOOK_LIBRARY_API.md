# BookVerse — Books & Library API

Base URL: `/api/v1`  
All endpoints require authentication (HttpOnly `accessToken` cookie or `Authorization: Bearer <token>`).

---

## Books

### POST `/books`

Create a book. Authenticated user becomes `owner`.

**Body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publisher": "Scribner",
  "publicationDate": "1925-04-10",
  "isbn": "9780743273565",
  "genre": "Fiction",
  "language": "English",
  "pages": 180,
  "coverImage": "https://example.com/cover.jpg",
  "description": "A classic American novel",
  "purchaseLinks": [
    { "platform": "Amazon", "url": "https://amazon.com/example" }
  ]
}
```

**Validation:** `title`, `author` required. ISBN unique if provided.

**Success — `201`:**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": { "book": { "_id": "...", "title": "...", "owner": { "name": "..." } } }
}
```

---

### GET `/books`

List current user's books with pagination, search, filter, sort.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default `1` |
| `limit` | number | Default `12`, max `100` |
| `search` | string | Search `title` or `author` |
| `genre` | string | Filter by genre |
| `language` | string | Filter by language |
| `sort` | string | `newest` (default), `oldest`, `title` |

**Success — `200`:**
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": { "books": [] },
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET `/books/:id`

Get single book by ID. Owner only.

**Success — `200`:** `{ "success": true, "data": { "book": {} } }`  
**Errors:** `400` invalid ID, `403` not owner, `404` not found

---

### PUT `/books/:id`

Update book. Owner only. Partial updates supported.

**Success — `200`:** `{ "success": true, "message": "Book updated successfully", "data": { "book": {} } }`

---

### DELETE `/books/:id`

Delete book and cascade-remove related library entries. Owner only.

**Success — `200`:** `{ "success": true, "message": "Book deleted successfully" }`

---

## Library

### POST `/library`

Add a book to the user's library.

**Body:**
```json
{
  "book": "665a1b2c3d4e5f6789012345",
  "shelfType": "READING",
  "rating": 4,
  "review": "Really enjoying this so far",
  "notes": "Read chapter 3 tonight",
  "startedAt": "2026-06-01T00:00:00.000Z"
}
```

**Shelf types:** `READ`, `READING`, `WISHLIST`, `DROPPED` (default: `WISHLIST`)  
**Validation:** `book` required (MongoId). `rating` 1–5. One entry per user per book.

**Success — `201`:**
```json
{
  "success": true,
  "message": "Book added to library successfully",
  "data": { "entry": { "_id": "...", "shelfType": "READING", "book": {} } }
}
```

**Errors:** `409` duplicate entry

---

### GET `/library`

List current user's library entries.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default `1` |
| `limit` | number | Default `12`, max `100` |
| `shelfType` | string | `READ`, `READING`, `WISHLIST`, `DROPPED` |
| `sort` | string | `newest` (default), `oldest` |

**Success — `200`:**
```json
{
  "success": true,
  "message": "Library entries retrieved successfully",
  "data": { "entries": [] },
  "meta": { "page": 1, "limit": 12, "total": 5, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

---

### GET `/library/:id`

Get single library entry. Owner only.

---

### PUT `/library/:id`

Update shelf, rating, review, notes, dates. Owner only. `book` reference cannot change.

**Body (partial):**
```json
{
  "shelfType": "READ",
  "rating": 5,
  "review": "Finished — loved it",
  "finishedAt": "2026-06-07T00:00:00.000Z"
}
```

---

### DELETE `/library/:id`

Remove book from library. Owner only.

**Success — `200`:** `{ "success": true, "message": "Library entry removed successfully" }`

---

## Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Invalid ObjectId or bad request |
| `401` | Not authenticated |
| `403` | Not owner |
| `404` | Resource not found |
| `409` | Duplicate ISBN or library entry |
| `422` | Validation failed |
