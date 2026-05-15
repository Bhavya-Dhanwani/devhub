export const blogSocialChangedEvent = "devhub-blog-social-changed";

export function notifyBlogSocialChanged(detail = {}) {
  window.dispatchEvent(new window.CustomEvent(blogSocialChangedEvent, { detail }));
}
