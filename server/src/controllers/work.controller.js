const { Work, User, Comment } = require('../models');

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

    // Privacy check: only author can view DRAFT or PRIVATE works
    const isAuthor = req.user && (
      (req.user._id && req.user._id.toString() === work.author._id.toString()) ||
      (req.user.id && req.user.id.toString() === work.author._id.toString())
    );

    if (!isAuthor) {
      if (work.status === 'DRAFT') {
        return res.status(403).json({ success: false, message: 'This manuscript is a draft and not published.' });
      }
      if (work.visibility === 'PRIVATE') {
        return res.status(403).json({ success: false, message: 'This manuscript is private.' });
      }
    }

    // Increment view count atomically
    Work.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } }).exec();

    const isLiked = req.user ? work.likes.includes(req.user.id) : false;
    let workObj = work.toObject();

    // Filter out draft chapters for public non-author readers
    if (!isAuthor && workObj.chapters && Array.isArray(workObj.chapters)) {
      workObj.chapters = workObj.chapters.filter((ch) => ch.status !== 'DRAFT');
    }

    res.status(200).json({
      success: true,
      data: {
        ...workObj,
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

    const currentUserId = (req.user?._id || req.user?.id || req.auth?.userId)?.toString();
    const targetUserId = targetUser._id.toString();
    const isOwner = Boolean(currentUserId && currentUserId === targetUserId);

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

    const userId = (req.user?._id || req.user?.id).toString();
    if (work.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, content, status } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Chapter content is required.' });
    }

    const chapterNumber = work.chapters.length + 1;
    work.chapters.push({
      title: title || `Chapter ${chapterNumber}`,
      content,
      status: status || 'PUBLISHED',
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

    const userId = (req.user?._id || req.user?.id).toString();
    if (work.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const chapter = work.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });

    const { title, content, status } = req.body;
    if (title !== undefined) chapter.title = title;
    if (content !== undefined) chapter.content = content;
    if (status !== undefined) chapter.status = status;

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

// @desc    Delete a specific chapter
// @route   DELETE /api/works/:id/chapters/:chapterId
// @access  Private (Author only)
exports.deleteChapter = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const userId = (req.user?._id || req.user?.id).toString();
    if (work.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const chapter = work.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });

    work.chapters.pull({ _id: req.params.chapterId });
    await work.save();

    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully.',
      data: work,
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chapter.' });
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

// @desc    Toggle like on a specific chapter
// @route   POST /api/works/:id/chapters/:chapterId/like
// @access  Private
exports.toggleLikeChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const userId = req.user._id || req.user.id;

    const work = await Work.findById(id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const chapter = work.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });

    if (!chapter.likes) chapter.likes = [];
    const index = chapter.likes.findIndex(u => u.toString() === userId.toString());
    let isLiked = false;

    if (index === -1) {
      chapter.likes.push(userId);
      isLiked = true;
    } else {
      chapter.likes.splice(index, 1);
      isLiked = false;
    }

    chapter.likesCount = chapter.likes.length;
    await work.save();

    res.status(200).json({
      success: true,
      data: {
        isLiked,
        likesCount: chapter.likesCount,
      },
    });
  } catch (error) {
    console.error('Error toggling chapter like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle chapter like.' });
  }
};

// @desc    Get comments for a work (or specific chapter)
// @route   GET /api/works/:id/comments
// @access  Public
exports.getWorkComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId } = req.query;

    const filter = { work: id };
    if (chapterId) {
      filter.chapterId = chapterId;
    } else {
      filter.chapterId = null; // overall book comments
    }

    const comments = await Comment.find(filter)
      .populate('user', 'name username avatar penName role')
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user ? (req.user._id || req.user.id).toString() : null;

    const augmentedComments = comments.map(c => {
      const likesList = c.likes || [];
      const isLiked = currentUserId ? likesList.some(l => l.toString() === currentUserId) : false;
      return {
        ...c,
        isLiked,
        likesCount: c.likesCount || likesList.length,
      };
    });

    res.status(200).json({
      success: true,
      data: augmentedComments,
    });
  } catch (error) {
    console.error('Error fetching work comments:', error);
    res.status(500).json({ success: false, message: 'Failed to load comments.' });
  }
};

// @desc    Add comment / reply to a work or chapter
// @route   POST /api/works/:id/comments
// @access  Private
exports.addWorkComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentComment, chapterId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const work = await Work.findById(id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const comment = await Comment.create({
      user: userId,
      work: id,
      chapterId: chapterId || null,
      parentComment: parentComment || null,
      content: content.trim(),
    });

    // Update comment counters
    if (chapterId) {
      const ch = work.chapters.id(chapterId);
      if (ch) {
        ch.commentsCount = (ch.commentsCount || 0) + 1;
        await work.save();
      }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name username avatar penName role')
      .lean();

    res.status(201).json({
      success: true,
      data: {
        ...populatedComment,
        isLiked: false,
        likesCount: 0,
      },
    });
  } catch (error) {
    console.error('Error adding work comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

// @desc    Toggle like on a comment (works for reader & owner)
// @route   POST /api/works/:id/comments/:commentId/like
// @access  Private
exports.toggleLikeWorkComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (!comment.likes) comment.likes = [];
    const index = comment.likes.findIndex(u => u.toString() === userId.toString());
    let isLiked = false;

    if (index === -1) {
      comment.likes.push(userId);
      isLiked = true;
    } else {
      comment.likes.splice(index, 1);
      isLiked = false;
    }

    comment.likesCount = comment.likes.length;
    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        isLiked,
        likesCount: comment.likesCount,
      },
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle comment like.' });
  }
};

// @desc    Delete a comment (Allowed for Comment Author OR Work Owner)
// @route   DELETE /api/works/:id/comments/:commentId
// @access  Private
exports.deleteWorkComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const work = await Work.findById(id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    const isCommentAuthor = comment.user.toString() === userId;
    const isWorkOwner = work.author.toString() === userId;

    if (!isCommentAuthor && !isWorkOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await Comment.findByIdAndDelete(commentId);
    // Delete nested replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting work comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
};

// @desc    Rate & submit feedback for a specific chapter
// @route   POST /api/works/:id/chapters/:chapterId/rate
// @access  Private
exports.rateChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user._id || req.user.id;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5 stars.' });
    }

    const work = await Work.findById(id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found.' });

    const chapter = work.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });

    if (!chapter.ratings) chapter.ratings = [];
    const existingIndex = chapter.ratings.findIndex(r => r.user.toString() === userId.toString());

    if (existingIndex !== -1) {
      chapter.ratings[existingIndex].rating = parsedRating;
      if (feedback !== undefined) chapter.ratings[existingIndex].feedback = feedback.trim();
    } else {
      chapter.ratings.push({
        user: userId,
        rating: parsedRating,
        feedback: feedback ? feedback.trim() : '',
      });
    }

    // Recalculate average rating for chapter
    const totalStars = chapter.ratings.reduce((acc, r) => acc + r.rating, 0);
    chapter.ratingsCount = chapter.ratings.length;
    chapter.averageRating = Number((totalStars / chapter.ratingsCount).toFixed(1));

    await work.save();

    res.status(200).json({
      success: true,
      message: 'Chapter rating & feedback submitted!',
      data: {
        userRating: parsedRating,
        averageRating: chapter.averageRating,
        ratingsCount: chapter.ratingsCount,
      },
    });
  } catch (error) {
    console.error('Error rating chapter:', error);
    res.status(500).json({ success: false, message: 'Failed to submit chapter rating.' });
  }
};
