"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi } from "../api/blogs.api";

const HISTORY_LIMIT = 80;
const HISTORY_DEBOUNCE_MS = 700;
const HISTORY_THROTTLE_MS = 2500;

export function useBlogComposer({ blogId = null } = {}) {
  const router = useRouter();
  const isEditing = Boolean(blogId);
  const [title, setTitle] = useState("");
  const [subheading, setSubheading] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [category, setCategory] = useState("build logs");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [inlineImages, setInlineImages] = useState({});
  const [blockType, setBlockType] = useState("paragraph");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(Boolean(blogId));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const snapshotRef = useRef(null);
  const pendingHistoryRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const throttleTimerRef = useRef(null);

  const blockSnippets = useMemo(() => ({
    paragraph: "Start writing your paragraph...",
    heading: "## New heading",
    subheading: "### New subheading",
    quote: "> A thoughtful quote or key takeaway",
    list: "- First point\n- Second point",
    code: "```js\nconsole.log(\"Hello DevHub\");\n```",
  }), []);

  const shortcuts = useMemo(() => [
    ["Ctrl Alt 1", "Paragraph"],
    ["Ctrl Alt 2", "Heading"],
    ["Ctrl Alt 3", "Subheading"],
    ["Ctrl Alt 4", "Quote"],
    ["Ctrl Alt 5", "List"],
    ["Ctrl Alt 6", "Code"],
  ], []);

  const createSnapshot = () => ({
    category,
    coverFile,
    coverPreview,
    inlineImages,
    markdown,
    subheading,
    tags,
    title,
  });

  const restoreSnapshot = (snapshot) => {
    setTitle(snapshot.title);
    setSubheading(snapshot.subheading);
    setMarkdown(snapshot.markdown);
    setCategory(snapshot.category);
    setTags(snapshot.tags);
    setCoverFile(snapshot.coverFile);
    setCoverPreview(snapshot.coverPreview);
    setInlineImages(snapshot.inlineImages);
  };

  const hydrateBlog = (blog) => {
    const nextSnapshot = {
      category: blog.category || "build logs",
      coverFile: null,
      coverPreview: blog.coverImage?.url || "",
      inlineImages: {},
      markdown: blog.content || "",
      subheading: blog.subheading || "",
      tags: (blog.tags || []).map((tag) => `#${tag}`).join(" "),
      title: blog.title || "",
    };

    restoreSnapshot(nextSnapshot);
    snapshotRef.current = nextSnapshot;
    pendingHistoryRef.current = null;
    setPast([]);
    setFuture([]);
    setIsDirty(false);
  };

  useEffect(() => {
    snapshotRef.current = createSnapshot();
  });

  useEffect(() => {
    let isMounted = true;

    async function loadEditableBlog() {
      if (!blogId) {
        return;
      }

      setIsLoadingBlog(true);

      try {
        const blog = await blogsApi.getMineById(blogId);

        if (isMounted) {
          hydrateBlog(blog);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(getApiErrorMessage(error));
          router.replace("/dashboard");
        }
      } finally {
        if (isMounted) {
          setIsLoadingBlog(false);
        }
      }
    }

    loadEditableBlog();

    return () => {
      isMounted = false;
    };
  }, [blogId, router]);

  useEffect(() => () => {
    window.clearTimeout(debounceTimerRef.current);
    window.clearTimeout(throttleTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isDirty) {
      return undefined;
    }

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isDirty]);

  const pushHistorySnapshot = (snapshot) => {
    setPast((current) => [...current.slice(-(HISTORY_LIMIT - 1)), snapshot]);
    setFuture([]);
  };

  const flushPendingHistory = () => {
    if (!pendingHistoryRef.current) {
      return;
    }

    const snapshot = pendingHistoryRef.current;
    pendingHistoryRef.current = null;
    window.clearTimeout(debounceTimerRef.current);
    window.clearTimeout(throttleTimerRef.current);
    debounceTimerRef.current = null;
    throttleTimerRef.current = null;
    pushHistorySnapshot(snapshot);
  };

  const scheduleHistoryCommit = (snapshot) => {
    if (!pendingHistoryRef.current) {
      pendingHistoryRef.current = snapshot;
      setFuture([]);
      throttleTimerRef.current = window.setTimeout(flushPendingHistory, HISTORY_THROTTLE_MS);
    }

    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(flushPendingHistory, HISTORY_DEBOUNCE_MS);
  };

  const pushHistory = () => {
    flushPendingHistory();
    pushHistorySnapshot(snapshotRef.current || createSnapshot());
  };

  const commitField = (field, value, options = {}) => {
    const currentSnapshot = snapshotRef.current || createSnapshot();
    const nextValue = typeof value === "function" ? value(currentSnapshot[field]) : value;

    if (Object.is(currentSnapshot[field], nextValue)) {
      return;
    }

    if (options.debounce) {
      scheduleHistoryCommit(currentSnapshot);
    } else {
      pushHistory();
    }

    setIsDirty(true);

    const setters = {
      category: setCategory,
      coverFile: setCoverFile,
      coverPreview: setCoverPreview,
      inlineImages: setInlineImages,
      markdown: setMarkdown,
      subheading: setSubheading,
      tags: setTags,
      title: setTitle,
    };

    setters[field](nextValue);
  };

  const commitSnapshot = (nextSnapshot) => {
    pushHistory();
    setIsDirty(true);
    restoreSnapshot(nextSnapshot);
  };

  const undo = () => {
    flushPendingHistory();

    setPast((currentPast) => {
      if (!currentPast.length) {
        return currentPast;
      }

      const previousSnapshot = currentPast[currentPast.length - 1];
      const currentSnapshot = snapshotRef.current || createSnapshot();

      setFuture((currentFuture) => [currentSnapshot, ...currentFuture].slice(0, HISTORY_LIMIT));
      restoreSnapshot(previousSnapshot);

      return currentPast.slice(0, -1);
    });
  };

  const redo = () => {
    flushPendingHistory();

    setFuture((currentFuture) => {
      if (!currentFuture.length) {
        return currentFuture;
      }

      const nextSnapshot = currentFuture[0];
      const currentSnapshot = snapshotRef.current || createSnapshot();

      setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), currentSnapshot]);
      restoreSnapshot(nextSnapshot);

      return currentFuture.slice(1);
    });
  };

  const insertMarkdown = (snippet, after = "") => {
    commitField("markdown", (current) => {
      const prefix = current && !current.endsWith("\n") ? "\n\n" : "";
      return `${current}${prefix}${snippet}${after}`;
    });
  };

  const onCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new window.FileReader();
    reader.onload = () => {
      commitSnapshot({
        ...(snapshotRef.current || createSnapshot()),
        coverFile: file,
        coverPreview: String(reader.result || ""),
      });
    };
    reader.readAsDataURL(file);
  };

  const onInlineImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new window.FileReader();
    reader.onload = () => {
      const imageId = `inline-image:${Date.now().toString(36)}`;
      const imageUrl = String(reader.result || "");
      const currentSnapshot = snapshotRef.current || createSnapshot();
      const prefix = currentSnapshot.markdown && !currentSnapshot.markdown.endsWith("\n") ? "\n\n" : "";

      commitSnapshot({
        ...currentSnapshot,
        inlineImages: {
          ...currentSnapshot.inlineImages,
          [imageId]: imageUrl,
        },
        markdown: `${currentSnapshot.markdown}${prefix}![${file.name}](${imageId})`,
      });
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const insertBlock = (nextBlockType = blockType) => {
    insertMarkdown(blockSnippets[nextBlockType] || blockSnippets.paragraph);
  };

  const handleHistoryKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }

    return false;
  };

  const onHistoryKeyDown = (event) => {
    handleHistoryKeyDown(event);
  };

  const onBodyKeyDown = (event) => {
    if (handleHistoryKeyDown(event) !== false) {
      return;
    }

    if (!event.ctrlKey || !event.altKey) {
      return;
    }

    const shortcutBlocks = {
      1: "paragraph",
      2: "heading",
      3: "subheading",
      4: "quote",
      5: "list",
      6: "code",
    };
    const nextBlockType = shortcutBlocks[event.key];

    if (!nextBlockType) {
      return;
    }

    event.preventDefault();
    insertBlock(nextBlockType);
  };

  const normalizeTags = (value) => String(value || "")
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#+/, "").toLowerCase())
    .filter(Boolean)
    .join(",");

  const getPublishContent = () => Object.entries(inlineImages).reduce(
    (content, [imageId, imageUrl]) => content.replaceAll(`(${imageId})`, `(${imageUrl})`),
    markdown,
  );

  const suggestedTags = useMemo(
    () => Array.from(markdown.matchAll(/(^|\s)#([a-z0-9][\w-]*)/gi), (match) => match[2].toLowerCase()),
    [markdown],
  );

  const applySuggestedTags = () => {
    const currentTags = normalizeTags(tags).split(",").filter(Boolean);
    const mergedTags = new Set([...currentTags, ...suggestedTags]);
    commitField("tags", [...mergedTags].map((tag) => `#${tag}`).join(" "));
  };

  const publishBlog = async (status = "published") => {
    if (isPublishing) {
      return;
    }

    flushPendingHistory();
    setIsPublishing(true);

    try {
      const payload = {
        category,
        content: getPublishContent(),
        coverImage: coverFile,
        heading: title,
        status,
        subheading,
        tags: normalizeTags(tags),
        title,
      };

      if (isEditing) {
        await blogsApi.update(blogId, payload);
      } else {
        await blogsApi.create(payload);
      }

      setIsDirty(false);
      toast.success(getSuccessMessage({ isEditing, status }));
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    blockType,
    canRedo: future.length > 0,
    canUndo: past.length > 0,
    category,
    coverPreview,
    hasInlineImages: Object.keys(inlineImages).length > 0,
    isEditing,
    isLoadingBlog,
    isPublishing,
    markdown,
    shortcuts,
    subheading,
    suggestedTags,
    tags,
    title,
    applySuggestedTags,
    insertMarkdown,
    insertBlock,
    onBodyKeyDown,
    onCoverChange,
    onHistoryKeyDown,
    onInlineImageChange,
    publishBlog,
    redo,
    setBlockType,
    setCategory: (value) => commitField("category", value, { debounce: true }),
    setMarkdown: (value) => commitField("markdown", value, { debounce: true }),
    setSubheading: (value) => commitField("subheading", value, { debounce: true }),
    setTags: (value) => commitField("tags", value, { debounce: true }),
    setTitle: (value) => commitField("title", value, { debounce: true }),
    undo,
  };
}

function getSuccessMessage({ isEditing, status }) {
  if (isEditing) {
    return status === "draft" ? "Draft updated." : "Blog updated and published.";
  }

  return status === "draft" ? "Draft saved." : "Blog published.";
}
