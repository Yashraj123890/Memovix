-- Clean Markdown code ticks accidentally pasted around existing deliverable titles.
UPDATE "deliverables"
SET "title" = btrim(btrim("title"), '`')
WHERE "title" LIKE '`%' OR "title" LIKE '%`';
