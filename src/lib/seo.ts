export function pageHead(title: string, description: string, opts: { noindex?: boolean } = {}) {
  const fullTitle = `${title} | TalentBridge`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
  };
}
