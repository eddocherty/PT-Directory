-- Permanently deletes the 15 fictional example trainers (slugs like alex-example-london).
-- Their styles, goals and fake reviews go with them automatically.
delete from public.trainers where is_sample = true and source = 'sample' and slug like '%-example-%';

select count(*) as sample_trainers_left from public.trainers where is_sample = true;
