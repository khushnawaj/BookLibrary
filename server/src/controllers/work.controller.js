const { Work, User } = require('../models');

// @desc    Create a new creative work (Story, Poem, Blog, Diary)
// @route   POST /api/works
// @access  Private
exports.createWork = async (req, res) => {
  try {
    const {
      title,
      contentType,
      language,
      genre,
      summary,
      coverImage,
      status,
      visibility,
      initialChapterTitle,
      initialChapterContent,
    } = req.body;

    if (!title || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Title and content type are required.',
      });
    }

    const chapters = [];
    if (initialChapterContent) {
      chapters.push({
        title: initialChapterTitle || 'Chapter 1',
        content: initialChapterContent,
        chapterNumber: 1,
        publishedAt: new Date(),
      });
    }

    const authorId = req.user?._id || req.user?.id || req.auth?.userId;
    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.',
      });
    }

    const work = await Work.create({
      title,
      contentType: contentType.toUpperCase(),
      language: language || 'English',
      genre: genre || 'General',
      summary: summary || '',
      coverImage: coverImage || '',
      author: authorId,
      status: status || 'PUBLISHED',
      visibility: visibility || 'PUBLIC',
      chapters,
    });

    const populatedWork = await Work.findById(work._id).populate('author', 'name username avatar penName role');

    res.status(201).json({
      success: true,
      data: populatedWork,
    });
  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create work.',
    });
  }
};

// @desc    Get explore/feed works (Stories, Poems, Blogs, Diaries)
// @route   GET /api/works/explore
// @access  Public / Optional Auth
exports.getExploreWorks = async (req, res) => {
  try {
    const { contentType, language, genre, search, page = 1, limit = 9 } = req.query;

    const query = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (contentType && contentType !== 'ALL') {
      query.contentType = contentType.toUpperCase();
    }

    if (language && language !== 'ALL') {
      query.language = language;
    }

    if (genre && genre !== 'ALL') {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalWorks = await Work.countDocuments(query);
    const totalPages = Math.ceil(totalWorks / limit);

    const works = await Work.find(query)
      .populate('author', 'name username avatar penName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        works,
        page: parseInt(page),
        totalPages,
        totalWorks,
      },
    });
  } catch (error) {
    console.error('Error fetching explore works:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load works.',
    });
  }
};

// @desc    Get single work by ID with full chapter details
// @route   GET /api/works/:id
// @access  Public / Optional Auth
exports.getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('author', 'name username avatar penName bio role createdAt');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found.',
      });
    }

    // Increment view count atomically
    Work.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } }).exec();

    const isLiked = req.user ? work.likes.includes(req.user.id) : false;

    res.status(200).json({
      success: true,
      data: {
        ...work.toObject(),
        isLiked,
      },
    });
  } catch (error) {
    console.error('Error fetching work details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load work details.',
    });
  }
};

// @desc    Get user's published or draft works
// @route   GET /api/works/user/:username
// @access  Public / Private
exports.getUserWorks = async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isOwner = req.user && req.user._id.toString() === targetUser._id.toString();

    const query = { author: targetUser._id };
    if (!isOwner) {
      query.status = 'PUBLISHED';
      query.visibility = 'PUBLIC';
    }

    const works = await Work.find(query)
      .populate('author', 'name username avatar penName role')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: works,
    });
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ success: false, message: 'Failed to load user works.' });
  }
};

// @desc    Update work metadata or status
// @route   PUT /api/works/:id
// @access  Private (Author only)
exports.updateWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found.' });
    }

    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this work.' });
    }

    const { title, contentType, language, genre, summary, coverImage, status, visibility, isCompleted } = req.body;

    if (title) work.title = title;
    if (contentType) work.contentType = contentType.toUpperCase();
    if (language) work.language = language;
    if (genre !== undefined) work.genre = genre;
    if (summary !== undefined) work.summary = summary;
    if (coverImage !== undefined) work.coverImage = coverImage;
    if (status) work.status = status;
    if (visibility) work.visibility = visibility;
    if (isCompleted !== undefined) work.isCompleted = isCompleted;

    await work.save();

    const updatedWork = await Work.findById(work._id).populate('author', 'name username avatar penName role');

    res.status(200).json({
      success: true,
      data: updatedWork,
    });
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ success: false, message: 'Failed to update work.' });
  }
};

// @desc    Add a new chapter / entry to a work
// @route   POST /api/works/:id/chapters
// @access  Private (Author only)
exports.addChapter = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found.' });
    }

    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Chapter content is required.' });
    }

    const chapterNumber = work.chapters.length + 1;
    work.chapters.push({
      title: title || `Chapter ${chapterNumber}`,
      content,
      chapterNumber,
      publishedAt: new Date(),
    });

    await work.save();

    const updatedWork = await Work.findById(work._id).populate('author', 'name username avatar penName role');

    res.status(201).json({
      success: true,
      data: updatedWork,
    });
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).json({ success: false, message: 'Failed to add chapter.' });
  }
};

// @desc    Update a specific chapter
// @route   PUT /api/works/:id/chapters/:chapterId
// @access  Private (Author only)
exports.updateChapter = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const chapter = work.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });

    const { title, content } = req.body;
    if (title) chapter.title = title;
    if (content) chapter.content = content;

    await work.save();

    res.status(200).json({
      success: true,
      data: work,
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ success: false, message: 'Failed to update chapter.' });
  }
};

// @desc    Delete a work
// @route   DELETE /api/works/:id
// @access  Private (Author only)
exports.deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await work.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Work deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ success: false, message: 'Failed to delete work.' });
  }
};

// @desc    Toggle like on a work
// @route   POST /api/works/:id/like
// @access  Private
exports.toggleLikeWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const index = work.likes.indexOf(req.user.id);
    let isLiked = false;

    if (index === -1) {
      work.likes.push(req.user.id);
      isLiked = true;
    } else {
      work.likes.splice(index, 1);
      isLiked = false;
    }

    work.stats.likesCount = work.likes.length;
    await work.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: work.stats.likesCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};
