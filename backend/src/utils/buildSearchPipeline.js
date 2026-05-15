const defaultSort = { finalScore: -1, createdAt: -1 };

export function buildSearchPipeline(params) {
  const match = buildMatchStage(params);
  const skip = (params.page - 1) * params.limit;
  const escapedQuery = escapeRegExp(params.q);
  const textScore = params.q ? { $meta: "textScore" } : 0;
  const exactTitleMatch = {
    $cond: [
      { $eq: [{ $toLower: "$title" }, params.q] },
      100,
      0,
    ],
  };
  const prefixTitleMatch = params.q
    ? {
        $cond: [
          { $regexMatch: { input: "$title", regex: `^${escapedQuery}`, options: "i" } },
          40,
          0,
        ],
      }
    : 0;
  const popularityScore = {
    $add: [
      { $ifNull: ["$views", 0] },
      { $multiply: [{ $ifNull: ["$likesCount", 0] }, 5] },
      { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 3] },
    ],
  };
  const freshnessScore = {
    $max: [
      0,
      {
        $subtract: [
          365,
          {
            $divide: [
              { $subtract: ["$$NOW", "$createdAt"] },
              86_400_000,
            ],
          },
        ],
      },
    ],
  };

  return [
    { $match: match },
    {
      $addFields: {
        textScore,
        exactTitleMatch,
        prefixTitleMatch,
        popularityScore,
        freshnessScore,
        finalScore: {
          $add: [
            { $multiply: [textScore, 10] },
            exactTitleMatch,
            prefixTitleMatch,
            { $multiply: [popularityScore, 0.05] },
            { $multiply: [freshnessScore, 0.01] },
          ],
        },
      },
    },
    { $sort: buildSortStage(params.sort) },
    {
      $project: {
        title: 1,
        slug: 1,
        heading: 1,
        excerpt: 1,
        coverImage: {
          url: "$coverImage.url",
        },
        tags: 1,
        category: 1,
        views: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        readTime: 1,
        finalScore: 1,
      },
    },
    { $skip: skip },
    { $limit: params.limit },
  ];
}

export function buildSearchCountPipeline(params) {
  return [
    { $match: buildMatchStage(params) },
    { $count: "total" },
  ];
}

function buildMatchStage({ category, q, tag }) {
  const match = { status: "published" };

  if (q) {
    match.$text = { $search: q };
  }

  if (category) {
    match.category = category;
  }

  if (tag) {
    match.tags = tag;
  }

  return match;
}

function buildSortStage(sort) {
  const sortMap = {
    relevance: defaultSort,
    latest: { createdAt: -1 },
    popular: { views: -1, likesCount: -1 },
    "most-liked": { likesCount: -1 },
    "most-commented": { commentsCount: -1 },
  };

  return sortMap[sort] || defaultSort;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
