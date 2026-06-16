const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const libraryService = require('../services/library.service');

const createLibraryEntry = asyncHandler(async (req, res) => {
  const entry = await libraryService.createLibraryEntry(req.user._id, req.body);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Book added to library successfully',
    data: { entry },
  });
});

const getLibraryEntries = asyncHandler(async (req, res) => {
  const { entries, meta } = await libraryService.getLibraryEntries(req.user._id, req.query);

  return ApiResponse.success(res, {
    message: 'Library entries retrieved successfully',
    data: { entries },
    meta,
  });
});

const getLibraryEntryById = asyncHandler(async (req, res) => {
  const entry = await libraryService.getLibraryEntryById(req.user._id, req.params.id);

  return ApiResponse.success(res, {
    message: 'Library entry retrieved successfully',
    data: { entry },
  });
});

const updateLibraryEntry = asyncHandler(async (req, res) => {
  const entry = await libraryService.updateLibraryEntry(req.user._id, req.params.id, req.body);

  return ApiResponse.success(res, {
    message: 'Library entry updated successfully',
    data: { entry },
  });
});

const deleteLibraryEntry = asyncHandler(async (req, res) => {
  await libraryService.deleteLibraryEntry(req.user._id, req.params.id);

  return ApiResponse.success(res, {
    message: 'Library entry removed successfully',
  });
});

module.exports = {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry,
};
