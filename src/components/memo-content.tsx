import { marked } from "marked";

export function MemoContent({ content }: { content: string }) {
  const html = marked.parse(content, { async: false }) as string;

  return (
    <article
      className="memo-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
