import { FITNESS_GOALS, GENDERS, RADII, TRAINING_STYLES } from "@/lib/taxonomy";

type Props = {
  action?: string;
  values: {
    location?: string;
    radius?: number;
    styles?: string[];
    goals?: string[];
    online?: boolean;
    homeVisits?: boolean;
    maxPrice?: number;
    gender?: string;
    q?: string;
  };
};

/** Plain GET form so filtering works without client JavaScript and every result page has a shareable URL. */
export function FilterForm({ action = "/trainers", values }: Props) {
  return (
    <form action={action} className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-4 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Postcode or town</span>
        <input name="location" defaultValue={values.location} placeholder="e.g. M4 or Leeds" className="input" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Within</span>
        <select name="radius" defaultValue={String(values.radius ?? 25)} className="input">
          {RADII.map((r) => (
            <option key={r} value={r}>{r} miles</option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 font-semibold">Training style</legend>
        {TRAINING_STYLES.map((s) => (
          <label key={s.slug} className="flex items-center gap-2">
            <input type="checkbox" name="style" value={s.slug} defaultChecked={values.styles?.includes(s.slug)} className="accent-brand" />
            {s.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 font-semibold">Fitness goal</legend>
        {FITNESS_GOALS.map((g) => (
          <label key={g.slug} className="flex items-center gap-2">
            <input type="checkbox" name="goal" value={g.slug} defaultChecked={values.goals?.includes(g.slug)} className="accent-brand" />
            {g.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 font-semibold">Sessions</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="online" value="1" defaultChecked={values.online} className="accent-brand" />
          Online coaching
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="home" value="1" defaultChecked={values.homeVisits} className="accent-brand" />
          Home visits
        </label>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Max price per session</span>
        <select name="maxPrice" defaultValue={values.maxPrice ? String(values.maxPrice) : ""} className="input">
          <option value="">Any</option>
          {[30, 40, 50, 60, 80].map((p) => (
            <option key={p} value={p}>Up to £{p}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Trainer gender</span>
        <select name="gender" defaultValue={values.gender ?? ""} className="input">
          <option value="">Any</option>
          {GENDERS.map((g) => (
            <option key={g.slug} value={g.slug}>{g.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Name or keyword</span>
        <input name="q" defaultValue={values.q} className="input" />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="btn flex-1">Show trainers</button>
        <a href={action} className="rounded-lg border border-line px-3 py-2 text-center hover:border-brand">Clear</a>
      </div>
    </form>
  );
}
