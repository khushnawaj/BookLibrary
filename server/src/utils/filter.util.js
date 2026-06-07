const buildBookFilter = ({ genre, language } = {}) => {
  const filter = {};

  if (genre?.trim()) {
    filter.genre = { $regex: genre.trim(), $options: 'i' };
  }

  if (language?.trim()) {
    filter.language = { $regex: language.trim(), $options: 'i' };
  }

  return filter;
};

const buildLibraryFilter = ({ shelfType } = {}) => {
  const filter = {};

  if (shelfType?.trim()) {
    filter.shelfType = shelfType.trim().toUpperCase();
  }

  return filter;
};

module.exports = { buildBookFilter, buildLibraryFilter };
