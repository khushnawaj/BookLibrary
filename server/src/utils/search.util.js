const buildBookSearchFilter = (search) => {
  if (!search || !search.trim()) return {};

  const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    $or: [
      { title: { $regex: term, $options: 'i' } },
      { author: { $regex: term, $options: 'i' } },
    ],
  };
};

module.exports = { buildBookSearchFilter };
