const axios = require('axios');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../constants');
const { redisClient } = require('../../config/redis')

// const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// const searchCache = new Map();

const normalizeDate = (date) => {
  if (!date) return '';
  if (/^\d{4}$/.test(date)) return `${date}-01-01`;
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`;
  return date.slice(0, 10);
};

const normalizeImageUrl = (url) => (url ? url.replace(/^http:\/\//, 'https://') : '');

const mapGoogleBook = (book) => {
  const info = book.volumeInfo || {};
  const identifiers = info.industryIdentifiers || [];
  const isbn =
    identifiers.find((item) => item.type === 'ISBN_13')?.identifier ||
    identifiers.find((item) => item.type === 'ISBN_10')?.identifier ||
    '';

  return {
    googleBooksId: book.id,
    title: info.title || '',
    author: info.authors?.join(', ') || '',
    publisher: info.publisher || '',
    publicationDate: normalizeDate(info.publishedDate),
    isbn,
    genre: info.categories?.[0] || '',
    language: info.language === 'en' ? 'English' : info.language || 'English',
    pages: info.pageCount || undefined,
    coverImage: normalizeImageUrl(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail),
    description: info.description || '',
    previewLink: info.previewLink || '',
    infoLink: info.infoLink || '',
  };
};

const getCacheKey = (query) =>
  `google-books:${query.trim().toLowerCase()}`;

const getGoogleBooksApiKey = () =>
  process.env.GOOGLE_BOOKS_API_KEY || process.env.googleBooKApiKey;

const handleGoogleBooksError = (error) => {
  const status = error.response?.status;

  if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    throw new AppError(
      'Google Books is rate-limiting searches right now. Please try again shortly.',
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  if (status === HTTP_STATUS.FORBIDDEN) {
    throw new AppError(
      'Google Books API key is invalid, restricted, or out of quota.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  if (error.code === 'ECONNABORTED') {
    throw new AppError('Google Books search timed out. Please try again.', HTTP_STATUS.BAD_REQUEST);
  }

  throw new AppError('Unable to search Google Books right now.', HTTP_STATUS.BAD_REQUEST);
};

const searchBooks = async (query) => {
  const cacheKey = getCacheKey(query);

  let cached = null;
  if (redisClient.isOpen) {
    try {
      cached = await redisClient.get(cacheKey);
    } catch (err) {
      console.warn('redis cache error', err.message);
    }
  }
  if (cached) {
    console.log('Redis cache hit')
    return {
      ...JSON.parse(cached),
      source: 'redis-cache'
    };
  }
  console.log('google book api hit')

  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        key: getGoogleBooksApiKey(),
        maxResults: 20,
      },
      timeout: 8000,
    });

    const books = (response.data.items || []).map(mapGoogleBook);

    if (redisClient.isOpen) {
      try {
        await redisClient.set(
          cacheKey,
          JSON.stringify({
            books,
            totalItems: response.data.totalItems || 0,
          }),
          {
            EX: 21600,
          }
        );
      } catch (err) {
        console.warn('redis cache set error', err.message);
      }
    }

    return {
      books,
      totalItems: response.data.totalItems || 0,
      source: 'google-books',
    };
  } catch (error) {
    handleGoogleBooksError(error);
  }
};

module.exports = {
  searchBooks,
};
