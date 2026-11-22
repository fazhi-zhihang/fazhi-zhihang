import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/fazhi/shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PhoneShell />;
}
