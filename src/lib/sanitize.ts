import sanitizeHtml from "sanitize-html";

const ALLOWED = {
  allowedTags: ["h2", "h3", "h4", "p", "br", "ul", "ol", "li", "a", "strong", "em", "blockquote", "figure", "figcaption", "img"],
  allowedAttributes: { a: ["href", "rel", "target"], img: ["src", "alt"] },
  allowedSchemes: ["https", "mailto"],
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
};

/** Used when saving AND when rendering, so stored HTML is never trusted. */
export const sanitize = (html: string) => sanitizeHtml(html, ALLOWED);
