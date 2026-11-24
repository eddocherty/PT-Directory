import type { Metadata } from "next";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { TOPICS } from "@/lib/topics";
import { searchTrainers } from "@/lib/trainers";

type Props = { searchParams: Promise<RawParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Online personal trainers in the UK",
    description: "Independent UK personal trainers and coaches who work with clients online, wherever you live. Compare specialisms and reviews.",
    alternates: { canonical: "/online" },
    robots: Object.keys(sp).length ? { index: false, follow: true } : undefined,
  };
}

export default async function OnlinePage({ searchParams }: Props) {
  const sp = await searchParams;
  const forced: RawParams = { ...sp, online: "1" };
  const f = parseFilters(forced);
  const { trainers, total } = await searchTrainers(f);
  return (
    <>
      <SearchLayout
        crumbs={[{ name: "Online coaching", href: "/online" }]}
        title="Online personal trainers"
        subtitle={`${total} UK trainers coach online as well as, or instead of, in person. Online coaching usually means video sessions, or a plan with regular check-ins. Ask each trainer how they work.`}
        filters={f}
        action="/trainers"
        trainers={trainers}
        total={total}
        params={forced}
        footer={
          <LinkSections>
            <LinkList title="Online coaching by specialism" items={TOPICS.map((t) => ({ href: `/trainers?online=1&${t.kind}=${t.slug}`, label: t.people }))} />
          </LinkSections>
        }
      />
      <JsonLd data={itemList(trainers.map((t) => ({ url: abs(`/trainers/${t.slug}`), name: t.name })))} />
    </>
  );
}
