-- Run ONCE in the connected PostgreSQL database SQL editor.
-- Keep all users, profiles, preferences and other information.
BEGIN;
UPDATE "Profile" SET "subCasteId" = NULL
WHERE "subCasteId" IN (
 SELECT s."id" FROM "SubCaste" s JOIN "Caste" c ON c."id"=s."casteId"
 JOIN "Religion" r ON r."id"=c."religionId" WHERE r."name"<>'Jain'
);
UPDATE "Profile" SET "casteId" = NULL
WHERE "casteId" IN (
 SELECT c."id" FROM "Caste" c JOIN "Religion" r ON r."id"=c."religionId"
 WHERE r."name"<>'Jain'
);
DELETE FROM "SubCaste" WHERE "casteId" IN (
 SELECT c."id" FROM "Caste" c JOIN "Religion" r ON r."id"=c."religionId"
 WHERE r."name"<>'Jain'
);
DELETE FROM "Caste" WHERE "religionId" IN (
 SELECT "id" FROM "Religion" WHERE "name"<>'Jain'
);
-- Religion records are left intact; public master APIs expose Jain only.
COMMIT;
