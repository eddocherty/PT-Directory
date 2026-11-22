-- Hides the 15 fictional example trainers so only real listings show.
-- Nothing is deleted: to bring them back, run the last line instead (remove the two dashes first).
update public.trainers set status = 'hidden' where is_sample = true;
-- update public.trainers set status = 'published' where is_sample = true;
