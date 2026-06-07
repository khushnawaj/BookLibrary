# BookVerse — Database Design

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOK : owns
    USER ||--o{ LIBRARY : has
    BOOK ||--o{ LIBRARY : appears_in

    USER {
        ObjectId _id PK
        string name
        string username UK
        string email UK
        string password
        string avatar
        string bio
        enum role "USER | ADMIN"
        boolean isVerified
        string refreshToken
        datetime createdAt
        datetime updatedAt
    }

    BOOK {
        ObjectId _id PK
        string title
        string author
        string publisher
        date publicationDate
        string isbn UK
        string genre
        string language
        number pages
        string coverImage
        string description
        array purchaseLinks
        ObjectId owner FK
        datetime createdAt
        datetime updatedAt
    }

    LIBRARY {
        ObjectId _id PK
        ObjectId user FK
        ObjectId book FK
        enum shelfType "READ | READING | WISHLIST | DROPPED"
        number rating "1-5"
        string review
        string notes
        date startedAt
        date finishedAt
        datetime createdAt
        datetime updatedAt
    }
```

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Book | One-to-Many | A user owns many books (`Book.owner`) |
| User → Library | One-to-Many | A user has many library entries |
| Book → Library | One-to-Many | A book can appear in many users' libraries |
| User + Book → Library | Unique pair | One library entry per user per book |

## Indexes

### User
- `email` — unique (schema level)
- `username` — unique (schema level)
- `role` — filter admins

### Book
- `{ title, author, genre }` — text search
- `{ owner, createdAt }` — user's books by date
- `isbn` — unique sparse
- `genre`, `author` — filter queries

### Library
- `{ user, book }` — unique compound
- `{ user, shelfType }` — shelf filtering
- `{ user, shelfType, updatedAt }` — recent activity
- `{ book, rating }` — aggregate ratings

## Virtual Fields

| Model | Virtual | Purpose |
|-------|---------|---------|
| User | `displayName` | Alias for `name` |
| Book | `ownerProfile` | Populate owner details |
| Library | `readingDurationDays` | Days between start and finish |
| Library | `bookDetails` | Populate linked book |
| Library | `userProfile` | Populate linked user |

## Shelf Types

| Value | Behavior |
|-------|----------|
| `READ` | Auto-sets `finishedAt` if missing |
| `READING` | Auto-sets `startedAt` if missing |
| `WISHLIST` | Default shelf for new entries |
| `DROPPED` | User stopped reading |
