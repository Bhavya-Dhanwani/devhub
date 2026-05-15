import { BlogDetailPage } from "@/features/blogs/ui/jsx/BlogDetailPage";

export default async function ProjectPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;

  return <BlogDetailPage backHref={getBackHref(query?.from)} contentType="project" slug={id} />;
}

function getBackHref(value) {
  const from = Array.isArray(value) ? value[0] : value;
  const allowedBackPaths = ["/bookmarks", "/dashboard", "/projects", "/search"];

  if (!from || from.startsWith("//") || !from.startsWith("/")) {
    return "/";
  }

  const pathname = from.split("?")[0];

  return allowedBackPaths.includes(pathname) ? from : "/";
}
