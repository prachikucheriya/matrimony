BEGIN;
INSERT INTO "Caste" ("id","name","religionId")
SELECT md5(random()::text || clock_timestamp()::text), v.name, r.id
FROM "Religion" r
CROSS JOIN (VALUES ('Jain Shwetambar Sthanakvasi'),('Jain Shwetambar Murtipujak'),('Terapanthi'),('Digambar')) AS v(name)
WHERE r.name='Jain'
ON CONFLICT ("religionId","name") DO NOTHING;
INSERT INTO "SubCaste" ("id","name","casteId")
SELECT md5(random()::text || clock_timestamp()::text),'General',c.id
FROM "Caste" c JOIN "Religion" r ON r.id=c."religionId"
WHERE r.name='Jain' AND c.name IN ('Jain Shwetambar Sthanakvasi','Jain Shwetambar Murtipujak','Terapanthi','Digambar')
ON CONFLICT ("casteId","name") DO NOTHING;
-- Do not remove existing profile relationships; old master records can be cleaned after test accounts.
COMMIT;
