"use client";

import Image from "next/image";
import {
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Pilcrow,
  Redo2,
  Undo2,
} from "lucide-react";
import { AuthGuard } from "@/features/auth/ui/jsx/AuthGuard";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useBlogComposer } from "../../hooks/useBlogComposer";
import { WriterAuthPrompt } from "./WriterAuthPrompt";
import styles from "../css/BlogComposer.module.css";

export function BlogComposerPage({ blogId = null, contentType = "blog" }) {
  const composer = useBlogComposer({ blogId, contentType });
  const isProject = contentType === "project";
  const contentLabel = isProject ? "Project" : "Article";
  const blockOptions = [
    ["paragraph", "Paragraph", "Ctrl Alt 1"],
    ["heading", "Heading", "Ctrl Alt 2"],
    ["subheading", "Subheading", "Ctrl Alt 3"],
    ["quote", "Quote", "Ctrl Alt 4"],
    ["list", "List", "Ctrl Alt 5"],
    ["code", "Code", "Ctrl Alt 6"],
    ["link", "Link", "Ctrl Alt 7"],
  ];
  const currentShortcut = blockOptions.find(([value]) => value === composer.blockType)?.[2];

  return (
    <AuthGuard fallback={<WriterAuthPrompt />} redirectToLogin={false}>
      <main className={styles.shell}>
        <AppSidebar collapsed />

        <section className={styles.canvas}>
          <header className={styles.topbar}>
            <div aria-hidden="true" />

            <div className={styles.rightActions}>
              <span className={styles.savedState}>
                <Check size={17} />
              </span>
              <button
                aria-label="Undo"
                title="Undo (Ctrl Z)"
                type="button"
                disabled={!composer.canUndo}
                onClick={composer.undo}
              >
                <Undo2 size={16} />
              </button>
              <button
                aria-label="Redo"
                title="Redo (Ctrl Y)"
                type="button"
                disabled={!composer.canRedo}
                onClick={composer.redo}
              >
                <Redo2 size={16} />
              </button>
              <button
                type="button"
                disabled={composer.isPublishing || composer.isLoadingBlog}
                onClick={() => composer.publishBlog("draft")}
              >
                {composer.isEditing ? "Update draft" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={composer.isPublishing || composer.isLoadingBlog}
                onClick={() => composer.publishBlog("published")}
              >
                {composer.isPublishing ? "Saving..." : composer.isEditing ? "Update" : "Publish"}
              </button>
            </div>
          </header>

          <article className={styles.editorSurface}>
            {composer.isLoadingBlog ? (
              <section className={styles.loadingEditor} role="status">
                Loading {isProject ? "project" : "blog"}...
              </section>
            ) : null}

            {!composer.isLoadingBlog ? (
              <>
            <div className={styles.inlineTools}>
              <label className={styles.blockSelectLabel}>
                <select
                  aria-label="Publish as"
                  value={composer.contentType}
                  disabled={composer.isEditing}
                  onChange={(event) => composer.setContentType(event.target.value)}
                >
                  <option value="blog">Blog</option>
                  <option value="project">Project</option>
                </select>
              </label>
              <label className={styles.toolButton}>
                <ImageIcon size={15} />
                Cover
                <input accept="image/*" type="file" onChange={composer.onCoverChange} />
              </label>
              <label className={styles.toolButton}>
                <ImageIcon size={15} />
                Image
                <input accept="image/*" type="file" onChange={composer.onInlineImageChange} />
              </label>
              <button
                className={styles.toolButton}
                title="Add link block (Ctrl Alt 7)"
                type="button"
                onClick={() => composer.insertBlock("link")}
              >
                <LinkIcon size={15} />
                Link
              </button>
              <label className={styles.blockSelectLabel}>
                <Pilcrow size={15} />
                <select
                  aria-label="Block type"
                  value={composer.blockType}
                  onChange={(event) => composer.setBlockType(event.target.value)}
                >
                  {blockOptions.map(([value, label, shortcut]) => (
                    <option value={value} key={value}>
                      {label} · {shortcut}
                    </option>
                  ))}
                </select>
                <kbd>{currentShortcut}</kbd>
              </label>
              <button type="button" onClick={() => composer.insertBlock()}>Add block</button>
            </div>

            {composer.hasInlineImages ? (
              <p className={styles.imageHint}>
                Inline images attached
              </p>
            ) : null}

            {composer.coverPreview ? (
              <div className={styles.coverPreview}>
                <Image src={composer.coverPreview} alt="" fill sizes="720px" unoptimized />
              </div>
            ) : null}

            <input
              className={styles.titleInput}
              aria-label={`${contentLabel} title`}
              placeholder={`${contentLabel} Title...`}
              value={composer.title}
              onKeyDown={composer.onHistoryKeyDown}
              onChange={(event) => composer.setTitle(event.target.value)}
            />

            <input
              className={styles.subheadingInput}
              aria-label={`${contentLabel} subheading`}
              placeholder="Subheading"
              value={composer.subheading}
              onKeyDown={composer.onHistoryKeyDown}
              onChange={(event) => composer.setSubheading(event.target.value)}
            />

            <div className={styles.metaFields}>
              <label>
                <span>Category</span>
                <input
                  aria-label={`${contentLabel} category`}
                  placeholder={isProject ? "project" : "build logs"}
                  value={composer.category}
                  onKeyDown={composer.onHistoryKeyDown}
                  onChange={(event) => composer.setCategory(event.target.value)}
                />
              </label>
              <label>
                <span>Tags</span>
                <input
                  aria-label="Article tags"
                  placeholder="react, auth, node"
                  value={composer.tags}
                  onKeyDown={composer.onHistoryKeyDown}
                  onChange={(event) => composer.setTags(event.target.value)}
                />
              </label>
            </div>

            {composer.suggestedTags.length ? (
              <div className={styles.hashtagRow}>
                <span>Detected hashtags</span>
                {composer.suggestedTags.slice(0, 6).map((tag) => (
                  <button key={tag} type="button" onClick={composer.applySuggestedTags}>
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}

            <textarea
              className={styles.bodyInput}
              aria-label={`${contentLabel} body`}
              placeholder={isProject ? "Describe your project. #hashtags work here." : "Write your post. #hashtags work here."}
              value={composer.markdown}
              onKeyDown={composer.onBodyKeyDown}
              onChange={(event) => composer.setMarkdown(event.target.value)}
            />
              </>
            ) : null}
          </article>
        </section>
      </main>
    </AuthGuard>
  );
}
