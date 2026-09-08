import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

export function MemberAvatar({
  member,
  size = "md",
}: {
  member: Member | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-11 text-sm" : "size-8 text-xs";
  if (!member) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
          dim
        )}
      >
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm",
        dim
      )}
      style={{ background: `hsl(${member.hue} 42% 42%)` }}
      title={member.name}
    >
      {member.initials}
    </span>
  );
}
