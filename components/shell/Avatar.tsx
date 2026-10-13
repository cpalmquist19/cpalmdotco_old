import Image from "next/image";

// The name sits next to the avatar, so the photo is decorative and has an empty alt.
// Its test id exists because an empty-alt image has no role or name to query.
export function Avatar() {
  return (
    <Image
      src="/avatar.webp"
      alt=""
      width={32}
      height={32}
      data-testid="avatar"
      className="size-8 shrink-0 rounded-pill object-cover"
    />
  );
}
