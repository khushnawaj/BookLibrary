const xlsx = require('xlsx');
const csv = require('csv-parser');
const stream = require('stream');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { Book, Library, ImportHistory, Activity } = require('../models');
const { ACTIVITY_TYPES } = require('../models/Activity.model');
const { HTTP_STATUS, SHELF_TYPES } = require('../constants');

const parseCSV = async (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const escapeRegex = (string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

const importLibrary = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an Excel or CSV file', HTTP_STATUS.BAD_REQUEST);
  }

  const userId = req.user._id;
  let rawData = [];

  try {
    if (req.file.mimetype === 'text/csv') {
      rawData = await parseCSV(req.file.buffer);
    } else {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
  } catch (error) {
    throw new AppError('Failed to parse file. Please ensure it is a valid CSV or Excel format.', HTTP_STATUS.BAD_REQUEST);
  }

  let importedRecords = 0;
  let skippedRecords = 0;

  console.log(`[Import] Starting processing of ${rawData.length} rows from file: ${req.file.originalname}`);
  if (rawData.length > 0) {
    console.log('[Import] Sample row raw keys:', Object.keys(rawData[0]));
    console.log('[Import] Sample row raw data:', rawData[0]);
  }

  for (const row of rawData) {
    // Normalize keys to lowercase and trim spaces
    const normalizedRow = {};
    for (const key of Object.keys(row)) {
      if (key !== undefined && key !== null) {
        normalizedRow[String(key).trim().toLowerCase()] = row[key];
      }
    }

    const title = normalizedRow.title || normalizedRow['book title'] || normalizedRow['booktitle'];
    const author = normalizedRow.author || normalizedRow['book author'] || normalizedRow['bookauthor'] || normalizedRow['writer'];
    const shelfType = (normalizedRow.shelftype || normalizedRow.shelf || '').toString().trim().toUpperCase();
    const rating = parseFloat(normalizedRow.rating || 0);

    if (!title || !author) {
      console.log(`[Import] Skipped row due to missing title or author. Row keys: ${Object.keys(row)}, values: ${JSON.stringify(row)}`);
      skippedRecords++;
      continue;
    }

    // See if book exists for this owner (safe case-insensitive check using escaped regex)
    const escapedTitle = escapeRegex(String(title).trim());
    const escapedAuthor = escapeRegex(String(author).trim());
    let book = await Book.findOne({
      title: new RegExp(`^${escapedTitle}$`, 'i'),
      author: new RegExp(`^${escapedAuthor}$`, 'i'),
      owner: userId
    });
    
    if (!book) {
      book = await Book.create({
        title: String(title).trim(),
        author: String(author).trim(),
        publisher: (normalizedRow.publisher || '').toString().trim(),
        genre: (normalizedRow.genre || '').toString().trim(),
        language: (normalizedRow.language || 'English').toString().trim(),
        pages: parseInt(normalizedRow.pages || 0) || null,
        owner: userId,
      });
      
      await Activity.create({
        user: userId,
        type: ACTIVITY_TYPES.BOOK_ADDED,
        referenceId: book._id,
        metadata: { title: book.title },
      });
    }

    // Check if library entry exists
    const existingEntry = await Library.findOne({ user: userId, book: book._id });
    if (existingEntry) {
      console.log(`[Import] Skipped row "${title}" by ${author} because it already exists in user's library.`);
      skippedRecords++;
      continue;
    }

    const validatedShelf = Object.values(SHELF_TYPES).includes(shelfType) ? shelfType : SHELF_TYPES.READ;

    const libraryEntry = await Library.create({
      user: userId,
      book: book._id,
      shelfType: validatedShelf,
      rating: rating > 0 && rating <= 5 ? rating : null,
      finishedAt: validatedShelf === SHELF_TYPES.READ ? new Date() : null,
    });

    importedRecords++;
  }

  console.log(`[Import] Finished: ${importedRecords} imported, ${skippedRecords} skipped.`);

  const history = await ImportHistory.create({
    user: userId,
    filename: req.file.originalname,
    totalRecords: rawData.length,
    importedRecords,
    skippedRecords,
  });

  return ApiResponse.success(res, {
    message: 'Import completed successfully',
    data: {
      summary: {
        total: rawData.length,
        imported: importedRecords,
        skipped: skippedRecords,
      },
      historyId: history._id
    }
  });
});

module.exports = {
  importLibrary,
};
