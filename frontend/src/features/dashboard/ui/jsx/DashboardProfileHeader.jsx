import { AtSign, ChevronDown, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import styles from "../css/DashboardProfileHeader.module.css";

export function DashboardProfileHeader({
  isLoggingOut = false,
  showActions = true,
  showDrafts = true,
  stats,
  user,
  username,
  onLogout,
  onEditProfile,
  onUpdateProfile,
  isEditProfileOpen = false,
  isUpdatingProfile = false,
  profileAction = null,
}) {
  const [formState, setFormState] = useState({
    avatar: null,
    avatarPreview: "",
    banner: null,
    bannerPreview: "",
    bio: "",
    name: "",
    portfolio: [],
    removeAvatar: false,
    removeBanner: false,
    skillsText: "",
    socialLinks: {
      github: "",
      linkedin: "",
      website: "",
      twitter: "",
    },
    username: "",
  });
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (!isEditProfileOpen) {
      return;
    }

    setFormState({
      avatar: null,
      avatarPreview: user?.avatar || "",
      banner: null,
      bannerPreview: user?.banner || "",
      bio: user?.bio || "",
      name: user?.name || "",
      portfolio: normalizePortfolio(user?.portfolio),
      removeAvatar: false,
      removeBanner: false,
      skillsText: (user?.skills || []).join(", "),
      socialLinks: {
        github: user?.socialLinks?.github || "",
        linkedin: user?.socialLinks?.linkedin || "",
        website: user?.socialLinks?.website || "",
        twitter: user?.socialLinks?.twitter || "",
      },
      username: user?.username || "",
    });
  }, [isEditProfileOpen, user, username]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormState((current) => ({
      ...current,
      avatar: file,
      avatarPreview: window.URL.createObjectURL(file),
      removeAvatar: false,
    }));
  };

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormState((current) => ({
      ...current,
      banner: file,
      bannerPreview: window.URL.createObjectURL(file),
      removeBanner: false,
    }));
  };

  const handleSocialChange = (event) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [name]: value,
      },
    }));
  };

  const updatePortfolioItem = (index, field, value) => {
    setFormState((current) => ({
      ...current,
      portfolio: current.portfolio.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addPortfolioItem = () => {
    setFormState((current) => ({
      ...current,
      portfolio: [...current.portfolio, { title: "", description: "", url: "" }].slice(0, 6),
    }));
  };

  const removePortfolioItem = (index) => {
    setFormState((current) => ({
      ...current,
      portfolio: current.portfolio.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdateProfile?.({
      avatar: formState.avatar,
      banner: formState.banner,
      bio: formState.bio,
      name: formState.name,
      portfolio: formState.portfolio,
      removeAvatar: formState.removeAvatar,
      removeBanner: formState.removeBanner,
      skills: formState.skillsText.split(/[\n,]+/).map((skill) => skill.trim()).filter(Boolean),
      socialLinks: formState.socialLinks,
      username: formState.username,
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.banner}>
        {user?.banner ? <Image src={user.banner} alt="" fill className={styles.bannerImage} unoptimized /> : null}
      </div>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user?.name || "Developer"} avatar`}
              fill
              className={styles.avatarImage}
              unoptimized
            />
          ) : (
            <span>{(user?.name || "D").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.mobileTopBar}>
          {showActions ? (
            <button className={styles.mobileIconButton} type="button" aria-label="Settings">
              <Settings size={20} />
            </button>
          ) : <span />}
          <p>
            {username}
            <ChevronDown size={14} />
          </p>
          {showActions ? (
            <button className={styles.mobileIconButton} type="button" aria-label="Threads">
              <AtSign size={20} />
            </button>
          ) : <span />}
        </div>

        <div className={styles.identityRow}>
          <h1>{username}</h1>
          {showActions ? (
            <button className={styles.iconButton} type="button" aria-label="Profile settings">
              <Settings size={18} />
            </button>
          ) : null}
          {profileAction}
        </div>

        <div className={styles.stats}>
          <p><strong>{formatStat(stats.posts)}</strong> posts</p>
          <p><strong>{formatStat(stats.blogs)}</strong> blogs</p>
          <p><strong>{formatStat(stats.projects)}</strong> projects</p>
          {showDrafts ? <p><strong>{formatStat(stats.drafts)}</strong> drafts</p> : null}
          <p><strong>{formatStat(stats.followersCount)}</strong> followers</p>
          <p><strong>{formatStat(stats.followingCount)}</strong> following</p>
          <p><strong>{formatStat(stats.totalViews)}</strong> views</p>
          <p><strong>{formatStat(stats.totalLikes)}</strong> likes</p>
        </div>

        <div className={styles.mobileHero}>
          <div className={styles.mobileAvatar}>
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user?.name || "Developer"} avatar`}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            ) : (
              <span>{(user?.name || "D").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.mobileStats}>
            <p><strong>{formatStat(stats.posts)}</strong><span>posts</span></p>
            <p><strong>{formatStat(stats.followersCount)}</strong><span>followers</span></p>
            <p><strong>{formatStat(stats.followingCount)}</strong><span>following</span></p>
          </div>
        </div>

        <p className={styles.name}>{user?.name || "Developer"}</p>
        <p className={styles.bio}>
          {user?.bio || "Building useful products, sharing blog breakdowns, and shipping clean writer-first experiences."}
        </p>
        {user?.email || user?.websiteUrl ? (
          <p className={styles.link}>{user.email || user.websiteUrl}</p>
        ) : null}
        <ProfileShowcase user={user} />

        {showActions ? (
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => onEditProfile?.(true)}>
              Edit profile
            </Button>
            <Button
              className={styles.logoutButton}
              disabled={isLoggingOut}
              type="button"
              variant="secondary"
              onClick={onLogout}
            >
              <LogOut size={16} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        ) : null}

        <p className={styles.insight}>{formatStat(stats.totalViews)} total views across published work.</p>
      </div>

      {isEditProfileOpen ? (
        <div className={styles.modalBackdrop} role="presentation">
          <form className={styles.editModal} onSubmit={handleSubmit}>
            <header className={styles.modalHeader}>
              <div>
                <h2>Edit profile</h2>
                <p>Email and password are managed from account settings.</p>
              </div>
              <button
                className={styles.closeButton}
                disabled={isUpdatingProfile}
                type="button"
                aria-label="Close edit profile"
                onClick={() => onEditProfile?.(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.avatarEditor}>
              <button
                className={styles.avatarPicker}
                type="button"
                onClick={() => avatarInputRef.current?.click()}
              >
                {formState.avatarPreview ? (
                  <Image
                    src={formState.avatarPreview}
                    alt=""
                    fill
                    className={styles.avatarImage}
                    unoptimized
                  />
                ) : (
                  <span>{(formState.name || "D").slice(0, 1).toUpperCase()}</span>
                )}
              </button>
              <div>
                <strong>Profile photo</strong>
                <p>JPG, PNG, or WEBP up to 2MB.</p>
                <button
                  className={styles.removeAssetButton}
                  type="button"
                  onClick={() => setFormState((current) => ({
                    ...current,
                    avatar: null,
                    avatarPreview: "",
                    removeAvatar: true,
                  }))}
                >
                  Delete photo
                </button>
                <input
                  ref={avatarInputRef}
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className={styles.bannerEditor}>
              <button className={styles.bannerPicker} type="button" onClick={() => bannerInputRef.current?.click()}>
                {formState.bannerPreview ? (
                  <Image src={formState.bannerPreview} alt="" fill className={styles.bannerImage} unoptimized />
                ) : (
                  <span>Add banner</span>
                )}
              </button>
              <div className={styles.assetActions}>
                <button type="button" onClick={() => bannerInputRef.current?.click()}>
                  Change banner
                </button>
                <button
                  type="button"
                  onClick={() => setFormState((current) => ({
                    ...current,
                    banner: null,
                    bannerPreview: "",
                    removeBanner: true,
                  }))}
                >
                  Delete banner
                </button>
              </div>
              <input
                ref={bannerInputRef}
                hidden
                accept="image/jpeg,image/png,image/webp"
                type="file"
                onChange={handleBannerChange}
              />
            </div>

            <label className={styles.field}>
              <span>Name</span>
              <input
                maxLength={80}
                minLength={2}
                name="name"
                required
                value={formState.name}
                onChange={handleFieldChange}
              />
            </label>

            <label className={styles.field}>
              <span>Username</span>
              <input
                maxLength={32}
                minLength={3}
                name="username"
                pattern="[a-zA-Z0-9_]+"
                value={formState.username}
                onChange={handleFieldChange}
              />
            </label>

            <label className={styles.field}>
              <span>Bio</span>
              <textarea
                maxLength={180}
                name="bio"
                rows={4}
                value={formState.bio}
                onChange={handleFieldChange}
              />
            </label>

            <label className={styles.field}>
              <span>Skills</span>
              <input
                name="skillsText"
                placeholder="React, Node.js, MongoDB"
                value={formState.skillsText}
                onChange={handleFieldChange}
              />
            </label>

            <div className={styles.fieldGroup}>
              <span>Social links</span>
              {["github", "linkedin", "website", "twitter"].map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={`${key} URL`}
                  value={formState.socialLinks[key]}
                  onChange={handleSocialChange}
                />
              ))}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.groupHeader}>
                <span>Portfolio showcase</span>
                <button disabled={formState.portfolio.length >= 6} type="button" onClick={addPortfolioItem}>
                  Add
                </button>
              </div>
              {formState.portfolio.map((item, index) => (
                <div className={styles.portfolioEditorItem} key={index}>
                  <input
                    placeholder="Project title"
                    value={item.title}
                    onChange={(event) => updatePortfolioItem(index, "title", event.target.value)}
                  />
                  <input
                    placeholder="Project URL"
                    value={item.url}
                    onChange={(event) => updatePortfolioItem(index, "url", event.target.value)}
                  />
                  <textarea
                    placeholder="Short description"
                    rows={2}
                    value={item.description}
                    onChange={(event) => updatePortfolioItem(index, "description", event.target.value)}
                  />
                  <button type="button" onClick={() => removePortfolioItem(index)}>
                    Delete item
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <Button disabled={isUpdatingProfile} type="button" variant="secondary" onClick={() => onEditProfile?.(false)}>
                Cancel
              </Button>
              <Button disabled={isUpdatingProfile} type="submit">
                {isUpdatingProfile ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </header>
  );
}

function ProfileShowcase({ user }) {
  const socialEntries = Object.entries(user?.socialLinks || {}).filter(([, value]) => value);
  const portfolio = normalizePortfolio(user?.portfolio);

  if (!user?.skills?.length && !socialEntries.length && !portfolio.length) {
    return null;
  }

  return (
    <div className={styles.profileShowcase}>
      {user?.skills?.length ? (
        <section>
          <h2>Skills</h2>
          <div className={styles.skillList}>
            {user.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </section>
      ) : null}

      {socialEntries.length ? (
        <section>
          <h2>Social links</h2>
          <div className={styles.socialList}>
            {socialEntries.map(([label, href]) => (
              <a href={href} key={label} rel="noreferrer" target="_blank">
                {label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {portfolio.length ? (
        <section>
          <h2>Portfolio</h2>
          <div className={styles.portfolioList}>
            {portfolio.map((item, index) => (
              <a href={item.url || "#"} key={`${item.title}-${index}`} rel="noreferrer" target={item.url ? "_blank" : undefined}>
                <strong>{item.title || "Untitled project"}</strong>
                {item.description ? <span>{item.description}</span> : null}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function normalizePortfolio(items = []) {
  return Array.isArray(items) ? items.filter((item) => item?.title || item?.description || item?.url) : [];
}

function formatStat(value) {
  const number = Number(value) || 0;

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1)}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(number >= 10_000 ? 0 : 1)}K`;
  }

  return String(number);
}
