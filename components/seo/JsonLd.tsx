/**
 * Inline JSON-LD schema script. Pass any schema.org object (or array of objects).
 * Renders as <script type="application/ld+json"> with safely-stringified payload.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
