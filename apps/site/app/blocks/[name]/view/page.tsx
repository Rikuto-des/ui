import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks } from "@/lib/blocks";

export function generateStaticParams() {
  return blocks.map((block) => ({ name: block.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  return { title: `${blocks.find((b) => b.name === name)?.title ?? name} — Blocks` };
}

/** The block alone, as it renders in an app: the Blocks page shows it in a frame. */
export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const block = blocks.find((b) => b.name === name);
  if (!block) notFound();
  return (
    <div id="main" className="block-view">
      <block.Screen />
    </div>
  );
}
