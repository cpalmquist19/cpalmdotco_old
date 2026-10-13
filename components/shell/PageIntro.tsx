type Props = { eyebrow: string; title: string; intro: string };

export function PageIntro({ eyebrow, title, intro }: Props) {
  return (
    <div className="mt-8">
      <p className="text-sm tracking-wide text-text-muted uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-prose text-base text-text-muted">{intro}</p>
    </div>
  );
}
