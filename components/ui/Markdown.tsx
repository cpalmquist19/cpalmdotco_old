import ReactMarkdown, { type Components } from "react-markdown";

type Props = { children: string };

// The only elements a page or a chat answer can show (D-017, F4.3). Anything else is unwrapped
// to its text, and raw HTML is skipped, so the source can't add markup of its own.
const ALLOWED = ["p", "h2", "h3", "ul", "ol", "li", "a", "strong", "em", "code"] as const;

// Token classes only (CODING § 5). Links get no `urlTransform`: react-markdown's default
// blanks unsafe URLs such as javascript:, and overriding it would let them through.
const components: Components = {
  p: ({ children }) => <p className="mt-4 leading-7 text-text first:mt-0">{children}</p>,
  h2: ({ children }) => <h2 className="mt-8 text-xl font-semibold text-text">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-lg font-semibold text-text">{children}</h3>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => {
    // An unsafe URL comes through with no href. Show its text rather than a dead link.
    if (!href) return <>{children}</>;
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        className="rounded-sm text-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded-sm bg-surface px-1 py-0.5 font-mono">{children}</code>
  ),
};

export function Markdown({ children }: Props) {
  return (
    <ReactMarkdown allowedElements={ALLOWED} unwrapDisallowed skipHtml components={components}>
      {children}
    </ReactMarkdown>
  );
}
