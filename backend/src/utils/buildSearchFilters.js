export function buildSearchFilters({ authorId = "", category = "", tag = "" } = {}) {
  const filters = ["status:=published"];

  if (category) {
    filters.push(`category:=${escapeFilterValue(category)}`);
  }

  if (tag) {
    filters.push(`tags:=${escapeFilterValue(tag)}`);
  }

  if (authorId) {
    filters.push(`authorId:=${escapeFilterValue(authorId)}`);
  }

  return filters.join(" && ");
}

function escapeFilterValue(value) {
  return String(value).replace(/[`\\]/g, "");
}
