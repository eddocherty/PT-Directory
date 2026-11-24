/** Structured data for search engines. Rendered as a script tag Google reads; people never see it. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** The trainers shown on a listing page, as an ItemList of their profile URLs. */
export function itemList(urls: { url: string; name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: urls.map((u, i) => ({ "@type": "ListItem", position: i + 1, url: u.url, name: u.name })),
  };
}
