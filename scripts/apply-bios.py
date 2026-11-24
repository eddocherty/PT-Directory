# Apply reworded bios (JSON lines: {"s": slug, "b": bio}) to data/*.json and print SQL updates.
# Usage: python3 scripts/apply-bios.py bios.jsonl > supabase/data/richer-bios.sql
import json, glob, sys
new = {}
for line in open(sys.argv[1]):
    if line.strip():
        r = json.loads(line); new[r["s"]] = r["b"]
for f in sorted(glob.glob("data/batch-*.json")) + ["data/pilot-trainers.json"]:
    d = json.load(open(f)); hit = False
    for t in d:
        if t["slug"] in new: t["bio"] = new[t["slug"]]; hit = True
    if hit: json.dump(d, open(f, "w"), indent=2, ensure_ascii=False)
print("-- Fuller bios written from each trainer's own website. Skips claimed listings.\nbegin;")
for s, b in new.items():
    print(f"update public.trainers set bio = '{b.replace(chr(39), chr(39)*2)}' where slug = '{s}' and claimed_by is null;")
print("commit;")
