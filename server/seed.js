/**
 * BookVerse Seed Script
 * Creates 5 dummy users, 20 books, library entries, follows, and posts
 * Usage:  node seed.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User    = require('./src/models/User.model');
const Book    = require('./src/models/Book.model');
const Library = require('./src/models/Library.model');
const Post    = require('./src/models/Post.model');
const Follow  = require('./src/models/Follow.model');

/* ─────────────────────────────────────────────────────────────────────────── */
/*  STATIC DATA                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

const USERS = [
  {
    name: 'Aria Patel',
    username: 'aria_reads',
    email: 'aria@bookverse.dev',
    password: 'password123',
    bio: '📚 Bibliophile | Tea lover | Fantasy & Literary fiction. Currently building my TBR mountain one book at a time.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=aria&backgroundColor=b6e3f4',
  },
  {
    name: 'Marcus Webb',
    username: 'marcus_w',
    email: 'marcus@bookverse.dev',
    password: 'password123',
    bio: 'Sci-fi and non-fiction nerd. Engineer by day, reader by night. 300+ books read.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=marcus&backgroundColor=ffdfbf',
  },
  {
    name: 'Sofia Reyes',
    username: 'sofia_bookworm',
    email: 'sofia@bookverse.dev',
    password: 'password123',
    bio: 'Romance, mystery, and everything in between 🌹 Librarian & avid annotator.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=sofia&backgroundColor=d1d4f9',
  },
  {
    name: 'James Okafor',
    username: 'james_okafor',
    email: 'james@bookverse.dev',
    password: 'password123',
    bio: 'Historical fiction + biographies. I read so I can live a thousand lives 🌍',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=james&backgroundColor=c0aede',
  },
  {
    name: 'Yuki Tanaka',
    username: 'yuki_reads',
    email: 'yuki@bookverse.dev',
    password: 'password123',
    bio: 'Japanese literature, contemporary fiction, and Murakami obsessee 🍃',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=yuki&backgroundColor=b6e3f4',
  },
];

const BOOKS = [
  { title: 'The Midnight Library',   author: 'Matt Haig',              genre: 'Literary Fiction', pages: 304,  description: 'Between life and death there is a library…', coverImage: 'https://covers.openlibrary.org/b/isbn/9781786892737-L.jpg' },
  { title: 'Project Hail Mary',      author: 'Andy Weir',              genre: 'Science Fiction',  pages: 476,  description: 'A lone astronaut must save Earth from disaster.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg' },
  { title: 'The Thursday Murder Club', author: 'Richard Osman',        genre: 'Mystery',          pages: 400,  description: 'Four unlikely friends meet in a retirement village.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780241988268-L.jpg' },
  { title: 'Lessons in Chemistry',   author: 'Bonnie Garmus',          genre: 'Historical Fiction', pages: 390, description: 'A woman chemist in the 1960s becomes an unlikely TV cooking star.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780385547345-L.jpg' },
  { title: 'Atomic Habits',          author: 'James Clear',            genre: 'Non-Fiction',      pages: 320,  description: 'Tiny changes, remarkable results.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' },
  { title: 'Norwegian Wood',         author: 'Haruki Murakami',        genre: 'Literary Fiction', pages: 296,  description: 'A story of loss, melancholy, and love in 1960s Tokyo.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg' },
  { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction', pages: 400, description: 'An aging Hollywood icon reveals her scandalous life.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781501161933-L.jpg' },
  { title: 'Dune',                   author: 'Frank Herbert',          genre: 'Science Fiction',  pages: 688,  description: 'A saga of politics, religion, and ecology in the far future.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg' },
  { title: 'The Name of the Wind',   author: 'Patrick Rothfuss',       genre: 'Fantasy',          pages: 662,  description: 'A legendary figure tells the story of his remarkable life.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg' },
  { title: 'Educated',               author: 'Tara Westover',          genre: 'Memoir',           pages: 334,  description: 'A memoir about a woman who grows up in a survivalist family.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg' },
  { title: 'The Alchemist',          author: 'Paulo Coelho',           genre: 'Fiction',          pages: 208,  description: 'A shepherd boy travels from Spain to Egypt in search of treasure.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg' },
  { title: 'Sapiens',                author: 'Yuval Noah Harari',      genre: 'Non-Fiction',      pages: 443,  description: 'A brief history of humankind.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg' },
  { title: 'Piranesi',               author: 'Susanna Clarke',         genre: 'Fantasy',          pages: 272,  description: 'A man lives inside a mysterious house containing an infinite labyrinth.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg' },
  { title: 'A Little Life',          author: 'Hanya Yanagihara',       genre: 'Literary Fiction', pages: 720,  description: 'Four college friends try to survive and thrive in New York.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780804172707-L.jpg' },
  { title: 'The Great Alone',        author: 'Kristin Hannah',         genre: 'Historical Fiction', pages: 448, description: 'A family moves to the Alaskan wilderness.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg' },
  { title: 'Shoe Dog',               author: 'Phil Knight',            genre: 'Memoir',           pages: 400,  description: 'The creator of Nike tells his story.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg' },
  { title: 'The House in the Cerulean Sea', author: 'TJ Klune',       genre: 'Fantasy',          pages: 394,  description: 'A case worker is sent to check on a magical orphanage.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781250217318-L.jpg' },
  { title: 'Fourth Wing',            author: 'Rebecca Yarros',         genre: 'Fantasy',          pages: 517,  description: 'Dragons, war colleges, and forbidden romance.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg' },
  { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', genre: 'Literary Fiction', pages: 416, description: 'A story of friendship, love, and video games.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780593321201-L.jpg' },
  { title: 'The Poppy War',          author: 'R.F. Kuang',             genre: 'Fantasy',          pages: 545,  description: 'A war epic inspired by twentieth-century Chinese history.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780062662583-L.jpg' },
];

const SHELF_TYPES = ['READ', 'READING', 'WISHLIST', 'DROPPED'];

const POST_TEMPLATES = [
  {
    content: `Just finished "The Midnight Library" and I'm completely in pieces. Matt Haig has this beautiful way of making you feel every emotion at once. The concept of a library between life and death where you can explore alternate versions of yourself is just *chef's kiss* 📚✨`,
    hashtags: ['themidnightlibrary', 'matthaig', 'bookreview', 'mustread'],
  },
  {
    content: `Project Hail Mary was everything I didn't know I needed. The friendship that develops in this book is unlike anything I've read in sci-fi. Andy Weir absolutely outdid himself. If you haven't read it, stop what you're doing right now. 🚀`,
    hashtags: ['projecthailmary', 'andyweir', 'scifi', 'bookworm'],
  },
  {
    content: `Hot take: Atomic Habits changed how I approach reading goals more than any other book. I used to try to read 5 books a month and burn out. Now I just aim for 20 pages a day and I'm on track for 40 books this year! 📖 What's your reading habit?`,
    hashtags: ['atomichabits', 'jamesClear', 'readinggoals', 'bookishlife'],
  },
  {
    content: `Norwegian Wood by Murakami hits differently every time you read it. Reading it in autumn while the leaves fall is a completely different experience than reading it in summer. Some books are seasonal, this one is *permanently* autumn 🍂`,
    hashtags: ['murakami', 'norwegianwood', 'literaryfiction', 'classicreads'],
  },
  {
    content: `Piranesi is one of those rare books that feels like a dream while you're reading it. Susanna Clarke created something utterly unique — a mystery, a fantasy, and a meditation on memory all woven together. I read it in one sitting and I'm still thinking about it weeks later.`,
    hashtags: ['piranesi', 'susannaclarke', 'fantasy', 'bookrecommendation'],
  },
  {
    content: `Currently 60% through Dune and it's taken me 3 weeks because I keep stopping to re-read passages. The world-building is unlike anything. Herbert somehow made ecology, politics, and religion into the most riveting narrative possible 🏜️`,
    hashtags: ['dune', 'frankherbert', 'scifi', 'currentlyreading', 'classicscifi'],
  },
  {
    content: `The Seven Husbands of Evelyn Hugo is the most cinematic book I've ever read. Every chapter feels like a scene from a golden-age Hollywood film. Taylor Jenkins Reid is criminally underrated as a storyteller. Go read it. Now. I mean it.`,
    hashtags: ['evelynhugo', 'taylorjenkinsreid', 'bookreview', 'historicalfiction'],
  },
  {
    content: `Lessons in Chemistry is the perfect blend of funny, heartbreaking, and empowering. Elizabeth Zott is one of my all-time favourite fictional characters. The 1960s setting makes her story even more compelling given how much she had to fight just to be taken seriously.`,
    hashtags: ['lessonsinchemistry', 'bonniegarmus', 'historicalfiction', 'feministfiction'],
  },
  {
    content: `Just started The Name of the Wind and I now understand why people have been waiting 13 years for book 3. Patrick Rothfuss writes sentences that feel like music. I'm only 100 pages in and already obsessed with Kvothe.`,
    hashtags: ['nameofthewind', 'patrickrothfuss', 'fantasy', 'kingkillerchronicle'],
  },
  {
    content: `Educated by Tara Westover is one of those memoirs that you feel guilty reading because it's so compelling yet so painful. The resilience she shows is extraordinary. A must-read for anyone who believes in the transformative power of education 🎓`,
    hashtags: ['educated', 'tarawestover', 'memoir', 'nonfiction', 'mustread'],
  },
  {
    content: `Fourth Wing has completely taken over my life this past week. I meant to read one chapter before bed. I woke up at 4am having finished 200 pages. Dragons + enemies-to-lovers + war magic = the perfect fantasy cocktail 🐉🔥`,
    hashtags: ['fourthwing', 'rebeccayarros', 'fantasy', 'romantasy', 'booktok'],
  },
  {
    content: `"Tomorrow, and Tomorrow, and Tomorrow" made me feel nostalgic for a childhood I never had. It's not really about video games — it's about creativity, friendship, loss, and the way we can love someone deeply without ever being in love with them.`,
    hashtags: ['tomorrowandtomorrow', 'gabriellezevin', 'literaryfiction', 'friendship'],
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HELPERS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SEED                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  /* ── Wipe existing seed data (by emails) ── */
  const seedEmails = USERS.map((u) => u.email);
  const oldUsers   = await User.find({ email: { $in: seedEmails } }).select('_id');
  const oldIds     = oldUsers.map((u) => u._id);

  await Promise.all([
    User.deleteMany({ email: { $in: seedEmails } }),
    Book.deleteMany({ owner: { $in: oldIds } }),
    Library.deleteMany({ user: { $in: oldIds } }),
    Post.deleteMany({ author: { $in: oldIds } }),
    Follow.deleteMany({ $or: [{ follower: { $in: oldIds } }, { following: { $in: oldIds } }] }),
  ]);
  console.log('🧹 Old seed data cleared');

  /* ── Create users ── */
  const hashedPassword = await bcrypt.hash('password123', 12);
  const userDocs = await User.insertMany(
    USERS.map((u) => ({ ...u, password: hashedPassword, isVerified: true }))
  );
  console.log(`👥 Created ${userDocs.length} users`);

  /* ── Create books (each owned by a random user) ── */
  const bookDocs = await Book.insertMany(
    BOOKS.map((b) => ({
      ...b,
      owner: pick(userDocs)._id,
      publicationDate: daysAgo(Math.floor(Math.random() * 3000 + 365)),
    }))
  );
  console.log(`📚 Created ${bookDocs.length} books`);

  /* ── Create library entries: each user gets 8–12 random books ── */
  const libraryEntries = [];
  for (const user of userDocs) {
    const userBooks = pickN(bookDocs, 10);
    for (const book of userBooks) {
      const shelf = pick(SHELF_TYPES);
      libraryEntries.push({
        user: user._id,
        book: book._id,
        shelfType: shelf,
        rating: shelf === 'READ' ? Math.floor(Math.random() * 3) + 3 : null,
        review: shelf === 'READ' ? 'A wonderful read, highly recommend!' : '',
        startedAt: ['READING', 'READ'].includes(shelf) ? daysAgo(Math.floor(Math.random() * 30 + 5)) : null,
        finishedAt: shelf === 'READ' ? daysAgo(Math.floor(Math.random() * 10)) : null,
      });
    }
  }
  await Library.insertMany(libraryEntries, { ordered: false }).catch(() => {});
  console.log(`🗂️  Created ~${libraryEntries.length} library entries`);

  /* ── Follow relationships: each user follows 3 others ── */
  const followDocs = [];
  for (const user of userDocs) {
    const others = userDocs.filter((u) => !u._id.equals(user._id));
    const toFollow = pickN(others, 3);
    for (const target of toFollow) {
      followDocs.push({ follower: user._id, following: target._id });
    }
  }
  await Follow.insertMany(followDocs, { ordered: false }).catch(() => {});
  console.log(`🤝 Created ${followDocs.length} follow relationships`);

  /* ── Create posts ── */
  const postDocs = [];
  for (const template of POST_TEMPLATES) {
    const author = pick(userDocs);
    const refBook = Math.random() > 0.4 ? pick(bookDocs)._id : undefined;
    postDocs.push({
      author: author._id,
      content: template.content,
      hashtags: template.hashtags,
      visibility: 'PUBLIC',
      bookRef: refBook,
      likesCount: Math.floor(Math.random() * 42),
      commentsCount: Math.floor(Math.random() * 12),
      createdAt: daysAgo(Math.floor(Math.random() * 14)),
    });
  }
  // Add 8 extra quick posts
  const quickPosts = [
    'Just hit my reading goal for the month! 🎉 20 books in 2024 — let\'s go!',
    'Can we talk about how underrated novellas are? The ones that punch far above their weight?',
    'Rating system tier list: 5⭐ = changed my life | 4⭐ = loved it | 3⭐ = it was fine | 2⭐ = struggled | 1⭐ = DNF',
    'There\'s nothing better than finding a book you love so much you start rationing it so it lasts longer 📖',
    'Controversial opinion: Reading slumps are your brain telling you to reread an old favourite.',
    'The best thing about book clubs is being forced to read outside your comfort zone. Highly recommend.',
    'I judge a book\'s quality by how many times I quote it in casual conversation. Currently: The Alchemist is undefeated.',
    'My "currently reading" shelf has 4 books on it and I refuse to acknowledge this as a problem.',
  ];
  for (const content of quickPosts) {
    postDocs.push({
      author: pick(userDocs)._id,
      content,
      hashtags: ['bookworm', 'readinglife'],
      visibility: 'PUBLIC',
      likesCount: Math.floor(Math.random() * 28),
      commentsCount: Math.floor(Math.random() * 8),
      createdAt: daysAgo(Math.floor(Math.random() * 7)),
    });
  }

  await Post.insertMany(postDocs);
  console.log(`📝 Created ${postDocs.length} posts`);

  /* ── Summary ── */
  console.log('\n═══════════════════════════════════════════════');
  console.log('✅  SEED COMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('  Test accounts (all passwords: password123):');
  for (const u of USERS) {
    console.log(`    📧 ${u.email}  @${u.username}`);
  }
  console.log('═══════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
