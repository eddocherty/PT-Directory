import { FITNESS_GOALS, GENDERS, RADII, SPORTS, TRAINING_STYLES, type Option } from "@/lib/taxonomy";

type Values = {
  location?: string;
  radius?: number;
  styles?: string[];
  goals?: string[];
  sports?: string[];
  online?: boolean;
  homeVisits?: boolean;
  maxPrice?: number;
  gender?: string;
  q?: string;
};

function Pills({ name, options, selected }: { name: string; options: Option[]; selected?: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <label key={o.slug} className="cursor-pointer">
          <input type="checkbox" name={name} value={o.slug} defaultChecked={selected?.includes(o.slug)} className="peer sr-only" />
          <span className="inline-block rounded-full border border-line px-3 py-1 text-xs font-medium transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-accent hover:border-ink">
            {o.name}
          </span>
        </label>
      ))}
    </div>
  );
}

function Section({ title, open = false, count, children }: { title: string; open?: boolean; count?: number; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-t border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        <span>
          {title}
          {count ? <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-paper">{count}</span> : null}
        </span>
        <span className="text-lg transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

/** Plain GET form: works without client JS and every result page has a shareable URL. */
export function FilterForm({ action = "/trainers", values, hideLocation = false }: { action?: string; values: Values; hideLocation?: boolean }) {
  return (
    <form action={action} className="flex flex-col text-sm">
      {!hideLocation && (
        <div className="flex flex-col gap-2 pb-4">
          <label className="eyebrow" htmlFor="f-location">Where?</label>
          <input id="f-location" name="location" defaultValue={values.location} placeholder="Postcode or town" className="input" />
          <select name="radius" defaultValue={String(values.radius ?? 25)} className="input" aria-label="Distance">
            {RADII.map((r) => <option key={r} value={r}>Within {r} miles</option>)}
          </select>
        </div>
      )}
      {hideLocation && <input type="hidden" name="radius" value={values.radius ?? 25} />}

      <Section title="Training style" open count={values.styles?.length}>
        <Pills name="style" options={TRAINING_STYLES} selected={values.styles} />
      </Section>
      <Section title="Your goal" open count={values.goals?.length}>
        <Pills name="goal" options={FITNESS_GOALS} selected={values.goals} />
      </Section>
      <Section title="Sports & hobbies" count={values.sports?.length}>
        <Pills name="sport" options={SPORTS} selected={values.sports} />
      </Section>
      <Section title="Sessions & price" count={(values.online ? 1 : 0) + (values.homeVisits ? 1 : 0) + (values.maxPrice ? 1 : 0)}>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" name="online" value="1" defaultChecked={values.online} className="h-4 w-4 accent-ink" /> Online coaching</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="home" value="1" defaultChecked={values.homeVisits} className="h-4 w-4 accent-ink" /> Home visits</label>
          <select name="maxPrice" defaultValue={values.maxPrice ? String(values.maxPrice) : ""} className="input mt-1" aria-label="Max price">
            <option value="">Any price</option>
            {[30, 40, 50, 60, 80].map((p) => <option key={p} value={p}>Up to £{p} a session</option>)}
          </select>
        </div>
      </Section>
      <Section title="Trainer" count={(values.gender ? 1 : 0) + (values.q ? 1 : 0)}>
        <div className="flex flex-col gap-2">
          <select name="gender" defaultValue={values.gender ?? ""} className="input" aria-label="Trainer gender">
            <option value="">Any gender</option>
            {GENDERS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
          </select>
          <input name="q" defaultValue={values.q} placeholder="Name or keyword" className="input" />
        </div>
      </Section>

      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-paper py-4">
        <button type="submit" className="btn flex-1">Show trainers</button>
        <a href={action} className="btn-ghost px-4">Clear</a>
      </div>
    </form>
  );
}
