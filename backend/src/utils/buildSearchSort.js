export function buildSearchSort(sort = "relevance", hasQuery = true) {
  if (sort === "latest") {
    return "createdAt:desc";
  }

  if (sort === "popular") {
    return "popularityScore:desc,views:desc";
  }

  if (sort === "most-liked") {
    return "likesCount:desc,popularityScore:desc";
  }

  if (sort === "most-commented") {
    return "commentsCount:desc,popularityScore:desc";
  }

  return hasQuery
    ? "_text_match:desc,popularityScore:desc,createdAt:desc"
    : "popularityScore:desc,createdAt:desc";
}
