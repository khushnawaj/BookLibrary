const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const { User, Work, WritingTracker, WritingLog } = require('../models');

async function seedWritingTracker() {
  try {
    console.log('Connecting to MongoDB for tracker seeding...');
    await connectDB();

    // 1. Find or create demo user
    let user = await User.findOne();
    if (!user) {
      console.log('No user found, creating demo author user...');
      user = await User.create({
        name: 'Demo Author',
        username: 'demoauthor',
        email: 'demo@shelfforge.com',
        password: 'Password123!',
        penName: 'A. K. Author',
        role: 'USER',
      });
    }

    console.log(`Using user: ${user.username} (${user._id})`);

    // 2. Clear existing trackers & logs for this user to avoid conflicts
    await WritingTracker.deleteMany({ user: user._id });
    await WritingLog.deleteMany({ user: user._id });
    console.log('Cleaned existing trackers and logs for test user.');

    // 3. Find or create a linked Work
    let work = await Work.findOne({ author: user._id });
    if (!work) {
      work = await Work.create({
        title: 'The Chronicles of Aethelgard',
        contentType: 'STORY',
        genre: 'Fantasy',
        language: 'English',
        summary: 'An epic high fantasy tale of forgotten realms and lost magic.',
        author: user._id,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        chapters: [
          {
            title: 'Chapter 1: The Gathering Storm',
            content: 'The wind howled across the craggy peaks of Aethelgard as Elian tightened his cloak...',
            chapterNumber: 1,
            status: 'PUBLISHED',
            wordCount: 1250,
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Chapter 2: Whispers in the Dark',
            content: 'Deep beneath the obsidian citadel, ancient runes glowed with an eerie blue light...',
            chapterNumber: 2,
            status: 'DRAFT',
            wordCount: 1840,
            publishedAt: new Date(),
          },
        ],
      });
      console.log(`Created sample Work: "${work.title}"`);
    }

    // 4. Create Tracked Projects
    const tracker1 = await WritingTracker.create({
      user: user._id,
      work: work._id,
      trackerStatus: 'DRAFTING',
      plannedChapters: 20,
      whereILeftOff: 'Finished Chapter 2 draft. Need to revise Chapter 3 outline regarding the dragon guild.',
      nextAction: 'Write Chapter 3 scene where Elian meets the cartographer.',
      lastWorkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      priority: 1,
    });

    const tracker2 = await WritingTracker.create({
      user: user._id,
      work: null,
      title: 'Neon Horizon 2099',
      contentType: 'NOVEL',
      genre: 'Cyberpunk Sci-Fi',
      language: 'English',
      trackerStatus: 'EDITING',
      plannedChapters: 30,
      externalCounts: { drafted: 18, edited: 12, published: 5 },
      publications: [
        {
          platform: 'RoyalRoad',
          url: 'https://royalroad.com/sample',
          episodesPublished: 5,
          lastPublishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
      whereILeftOff: 'Polished Chapter 12 dialogue.',
      nextAction: 'Edit Chapters 13-15 before sending to beta readers.',
      lastWorkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: 2,
    });

    const tracker3 = await WritingTracker.create({
      user: user._id,
      work: null,
      title: 'Whispers of Monsoon',
      contentType: 'POEM',
      genre: 'Poetry / Romance',
      language: 'Hindi',
      trackerStatus: 'COMPLETED',
      plannedChapters: 10,
      externalCounts: { drafted: 10, edited: 10, published: 10 },
      whereILeftOff: 'Published full poetry collection on Kindle Direct.',
      nextAction: 'Promote link on social media.',
      lastWorkedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      priority: 3,
    });

    const tracker4 = await WritingTracker.create({
      user: user._id,
      work: null,
      title: 'The Clockwork Alchemist',
      contentType: 'SERIAL',
      genre: 'Steampunk Mystery',
      language: 'English',
      trackerStatus: 'DRAFTING',
      plannedChapters: 25,
      externalCounts: { drafted: 5, edited: 2, published: 0 },
      whereILeftOff: 'Drafted opening murder scene at the clocktower.',
      nextAction: 'Figure out detective backstory.',
      lastWorkedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // Neglected! (18 days ago)
      priority: 1,
    });

    console.log('Created 4 sample WritingTrackers (1 linked, 3 external).');

    // 5. Create Writing Logs for streak & 30-day stats testing
    const now = new Date();
    const logsToCreate = [
      { tracker: tracker1._id, daysAgo: 0, words: 850, note: 'Wrote draft of Chapter 2 climax.' },
      { tracker: tracker1._id, daysAgo: 1, words: 1200, note: 'Worked on character dynamics.' },
      { tracker: tracker2._id, daysAgo: 2, words: 650, note: 'Edited Chapter 12.' },
      { tracker: tracker1._id, daysAgo: 3, words: 920, note: 'Outlined Chapter 3.' },
      { tracker: tracker2._id, daysAgo: 4, words: 1100, note: 'Drafted dialogue scene.' },
      { tracker: tracker1._id, daysAgo: 5, words: 450, note: 'Quick morning writing sprint.' },
    ];

    for (const item of logsToCreate) {
      const logDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
      await WritingLog.create({
        user: user._id,
        tracker: item.tracker,
        date: logDate,
        wordsWritten: item.words,
        note: item.note,
      });
    }

    console.log('Created sample WritingLog entries.');
    console.log('✅ Writing Tracker Seeding Complete successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Writing Tracker:', err);
    process.exit(1);
  }
}

seedWritingTracker();
