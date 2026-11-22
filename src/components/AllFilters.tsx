import { FITNESS_GOALS, GENDERS, SPORTS, TRAINING_STYLES } from "@/lib/taxonomy";
import { Pills } from "./FilterForm";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Home page "All filters" button: opens a panel with every filter. Plain <details> + GET form, no client JS. */
export function AllFilters() {
  return (
    <details className="group mt-4 max-w-5xl">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-ink bg-paper px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-paper [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
        </svg>
        <span className="group-open:hidden">All filters</span>
        <span className="hidden group-open:inline">Hide filters</span>
        <span className="transition group-open:rotate-180" aria-hidden>▾</span>
      </summary>

      <form action="/trainers" className="mt-3 rounded-3xl border border-line bg-paper p-5 text-sm shadow-sm sm:p-7">
        <div className="grid gap-6 md:grid-cols-2">
          <Group title="Training style"><Pills name="style" options={TRAINING_STYLES} /></Group>
          <Group title="Your goal"><Pills name="goal" options={FITNESS_GOALS} /></Group>
          <Group title="Sports & hobbies"><Pills name="sport" options={SPORTS} /></Group>
          <div className="grid gap-6 sm:grid-cols-2">
            <Group title="Sessions">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2"><input type="checkbox" name="online" value="1" className="h-4 w-4 accent-ink" /> Online coaching</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="home" value="1" className="h-4 w-4 accent-ink" /> Home visits</label>
              </div>
            </Group>
            <Group title="Trainer">
              <div className="flex flex-col gap-2">
                <select name="gender" defaultValue="" className="input" aria-label="Trainer gender">
                  <option value="">Any gender</option>
                  {GENDERS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                </select>
                <input name="q" placeholder="Name or keyword" className="input" aria-label="Name or keyword" />
              </div>
            </Group>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row">
          <input name="location" placeholder="Postcode or town (optional)" aria-label="Postcode or town" className="input sm:flex-1" />
          <button type="submit" className="btn px-7">Show trainers</button>
        </div>
      </form>
    </details>
  );
}
