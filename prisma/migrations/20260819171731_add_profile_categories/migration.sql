-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartnerPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "anyCaste" BOOLEAN NOT NULL DEFAULT false,
    "preferredCasteIds" TEXT NOT NULL DEFAULT '[]',
    "workType" TEXT,
    "incomeRange" TEXT,
    "kundaliMatch" TEXT NOT NULL,
    "preferredCategories" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PartnerPreference" ("ageMax", "ageMin", "anyCaste", "createdAt", "id", "incomeRange", "kundaliMatch", "preferredCasteIds", "profileId", "updatedAt", "workType") SELECT "ageMax", "ageMin", "anyCaste", "createdAt", "id", "incomeRange", "kundaliMatch", "preferredCasteIds", "profileId", "updatedAt", "workType" FROM "PartnerPreference";
DROP TABLE "PartnerPreference";
ALTER TABLE "new_PartnerPreference" RENAME TO "PartnerPreference";
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "gender" TEXT,
    "dob" DATETIME,
    "motherTongue" TEXT,
    "height" TEXT,
    "birthPlace" TEXT,
    "birthTime" TEXT,
    "complexion" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "incomeRange" TEXT,
    "city" TEXT,
    "state" TEXT,
    "address" TEXT,
    "fatherName" TEXT,
    "fatherOccupation" TEXT,
    "motherName" TEXT,
    "motherOccupation" TEXT,
    "brothersCount" INTEGER,
    "brothersNames" TEXT,
    "sistersCount" INTEGER,
    "sistersNames" TEXT,
    "maritalStatus" TEXT,
    "spouseName" TEXT,
    "spouseOccupation" TEXT,
    "isDifferentlyAbled" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "religionId" TEXT,
    "casteId" TEXT,
    "subCasteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INCOMPLETE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_casteId_fkey" FOREIGN KEY ("casteId") REFERENCES "Caste" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_subCasteId_fkey" FOREIGN KEY ("subCasteId") REFERENCES "SubCaste" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("address", "birthPlace", "birthTime", "brothersCount", "brothersNames", "casteId", "city", "complexion", "createdAt", "displayName", "dob", "education", "fatherName", "fatherOccupation", "gender", "height", "id", "incomeRange", "maritalStatus", "motherName", "motherOccupation", "motherTongue", "occupation", "photoUrl", "religionId", "sistersCount", "sistersNames", "spouseName", "spouseOccupation", "state", "status", "subCasteId", "updatedAt", "userId") SELECT "address", "birthPlace", "birthTime", "brothersCount", "brothersNames", "casteId", "city", "complexion", "createdAt", "displayName", "dob", "education", "fatherName", "fatherOccupation", "gender", "height", "id", "incomeRange", "maritalStatus", "motherName", "motherOccupation", "motherTongue", "occupation", "photoUrl", "religionId", "sistersCount", "sistersNames", "spouseName", "spouseOccupation", "state", "status", "subCasteId", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
