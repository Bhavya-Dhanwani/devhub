"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { searchApi } from "../../api/search.api";
import { BlogResultGrid } from "./BlogResultGrid";
import styles from "../css/SearchBookmarks.module.css";

const sortOptions = [
  ["relevance", "Relevance"],
  ["latest", "Latest"],
  ["popular", "Popular"],
  ["most-liked", "Most liked"],
  ["most-commented", "Most commented"],
];

export function SearchPage() {
  const [query, setQuery] = useState(() => getInitialParam("q"));
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(() => getInitialPage());
  const [category, setCategory] = useState(() => getInitialParam("category"));
  const [tag, setTag] = useState(() => getInitialParam("tag"));
  const [sort, setSort] = useState(() => getInitialParam("sort") || "relevance");
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);
  const searchBoxRef = useRef(null);
  const trimmedQuery = debouncedQuery.trim();
  const activeQuery = query.trim();
  const categories = useMemo(() => getUniqueValues(blogs.map((blog) => blog.category)), [blogs]);
  const tags = useMemo(() => getUniqueValues(blogs.flatMap((blog) => blog.tags || [])), [blogs]);
  const memoryItems = recent.length ? recent : trending.map((item) => item.query);
  const dropdownItems = activeQuery.length >= 2
    ? suggestions.map((item) => ({ ...item, kind: "suggestion", value: item.title }))
    : memoryItems.slice(0, 8).map((item) => ({ kind: "memory", title: item, value: item }));
  const searchState = getSearchState({
    activeQuery,
    error,
    isFocused,
    isLoading,
    resultsCount: blogs.length,
    trimmedQuery,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    async function loadSearch() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await searchApi.searchBlogs({
          q: trimmedQuery,
          category,
          page,
          tag,
          sort,
          limit: 50,
        });

        if (isMounted) {
          setBlogs(payload.results || payload.blogs || []);
          setPagination(payload.pagination || null);
          setRecent((current) => rememberGuestSearch(current, trimmedQuery));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSearch();
    syncUrl({ category, page, q: trimmedQuery, sort, tag });

    return () => {
      isMounted = false;
    };
  }, [category, page, sort, tag, trimmedQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadSuggestions() {
      if (activeQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSuggestionsLoading(true);

      try {
        const payload = await searchApi.getSuggestions(activeQuery);

        if (isMounted) {
          setSuggestions(payload);
        }
      } catch {
        if (isMounted) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setIsSuggestionsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(loadSuggestions, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [activeQuery]);

  useEffect(() => {
    setActiveSuggestionIndex(dropdownItems.length ? 0 : -1);
  }, [activeQuery, dropdownItems.length, isFocused]);

  useEffect(() => {
    let isMounted = true;

    async function loadSearchMemory() {
      const [serverRecent, serverTrending] = await Promise.allSettled([
        searchApi.getRecent(),
        searchApi.getTrending(),
      ]);

      if (!isMounted) {
        return;
      }

      setRecent(serverRecent.status === "fulfilled" && serverRecent.value.length ? serverRecent.value : []);
      setTrending(serverTrending.status === "fulfilled" ? serverTrending.value : []);
    }

    loadSearchMemory();

    return () => {
      isMounted = false;
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function onDocumentClick(event) {
      if (!searchBoxRef.current?.contains(event.target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, []);

  const submitSearch = (nextQuery = query) => {
    const normalized = nextQuery.trim();
    setQuery(normalized);
    setDebouncedQuery(normalized);
    setPage(1);
    setIsFocused(false);
    setActiveSuggestionIndex(-1);
    setRecent((current) => rememberGuestSearch(current, normalized));
  };

  const showDropdown = isFocused && (activeQuery.length >= 2 || recent.length || trending.length);
  const onSearchKeyDown = (event) => {
    if (!showDropdown || !dropdownItems.length) {
      if (event.key === "Enter") {
        submitSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current + 1) % dropdownItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current <= 0 ? dropdownItems.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedItem = dropdownItems[activeSuggestionIndex];
      submitSearch(selectedItem?.value || query);
      return;
    }

    if (event.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content} data-search-state={searchState}>
        <header className={styles.header}>
          <p>Search</p>
          <h1>Find blogs</h1>
          <div className={styles.searchArea} ref={searchBoxRef}>
            <label className={styles.searchBox}>
              <Search size={18} />
              <input
                autoFocus
                placeholder="Search by title, content, tag, or category"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                onFocus={() => setIsFocused(true)}
                onKeyDown={onSearchKeyDown}
              />
              {query ? (
                <button className={styles.clearSearchButton} type="button" onClick={() => setQuery("")}>
                  <X size={15} />
                </button>
              ) : null}
            </label>

            {showDropdown ? (
              <div className={styles.suggestionsPanel}>
                {activeQuery.length >= 2 ? (
                  <>
                    <p>{isSuggestionsLoading ? "Searching..." : "Suggestions"}</p>
                    {suggestions.length ? suggestions.map((item, index) => (
                      <button
                        key={item.id || item.slug}
                        className={index === activeSuggestionIndex ? styles.suggestionActive : ""}
                        type="button"
                        onClick={() => submitSearch(item.title)}
                      >
                        <Search size={15} />
                        <span>{item.title}</span>
                        <em>blog</em>
                      </button>
                    )) : !isSuggestionsLoading ? (
                      <span className={styles.suggestionEmpty}>No suggestions yet</span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p>{recent.length ? "Recent searches" : "Trending searches"}</p>
                    {memoryItems.slice(0, 8).map((item, index) => (
                      <button
                        className={index === activeSuggestionIndex ? styles.suggestionActive : ""}
                        key={item}
                        type="button"
                        onClick={() => submitSearch(item)}
                      >
                        <Search size={15} />
                        <span>{item}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : null}
          </div>

          <div className={styles.filters}>
            <SlidersHorizontal size={16} />
            <select value={sort} onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}>
              {sortOptions.map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
            <select value={category} onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
            <select value={tag} onChange={(event) => {
              setTag(event.target.value);
              setPage(1);
            }}>
              <option value="">All tags</option>
              {tags.map((item) => (
                <option value={item} key={item}>#{item}</option>
              ))}
            </select>
          </div>
          <span className={styles.resultHint}>
            {trimmedQuery ? `${blogs.length} result${blogs.length === 1 ? "" : "s"} for "${trimmedQuery}"` : "Search published posts on DevHub"}
          </span>
        </header>

        <BlogResultGrid
          blogs={blogs}
          emptyText={trimmedQuery ? "No blogs matched your search." : "No published blogs yet."}
          error={error}
          isLoading={isLoading}
          loadingText="Searching blogs..."
          query={trimmedQuery}
          source="search"
        />
        {pagination?.totalPages > 1 ? (
          <nav className={styles.pagination} aria-label="Search pagination">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </nav>
        ) : null}
      </section>
    </main>
  );
}

function getInitialParam(key) {
  if (typeof window === "undefined") {
    return "";
  }

  return new window.URLSearchParams(window.location.search).get(key) || "";
}

function getInitialPage() {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.max(Number.parseInt(new window.URLSearchParams(window.location.search).get("page"), 10) || 1, 1);
}

function syncUrl({ category, page, q, sort, tag }) {
  const params = new window.URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (category) {
    params.set("category", category);
  }

  if (tag) {
    params.set("tag", tag);
  }

  if (sort && sort !== "relevance") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search";
  window.history.replaceState(null, "", nextUrl);
}

function getSearchState({ activeQuery, error, isFocused, isLoading, resultsCount, trimmedQuery }) {
  if (error) {
    return "error";
  }

  if (isLoading) {
    return "loading";
  }

  if (trimmedQuery && !resultsCount) {
    return "no-results";
  }

  if (resultsCount) {
    return "results";
  }

  if (activeQuery) {
    return "typing";
  }

  if (isFocused) {
    return "focused";
  }

  return "idle";
}

function getUniqueValues(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));
}

function rememberGuestSearch(recent, query) {
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 2) {
    return recent;
  }

  return [normalized, ...recent.filter((item) => item !== normalized)].slice(0, 10);
}
