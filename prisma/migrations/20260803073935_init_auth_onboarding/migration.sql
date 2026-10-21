-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "email" TEXT,
    "phoneVerifiedAt" DATETIME,
    "emailVerifiedAt" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Religion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Caste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "religionId" TEXT NOT NULL,
    CONSTRAINT "Caste_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubCaste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "casteId" TEXT NOT NULL,
    CONSTRAINT "SubCaste_casteId_fkey" FOREIGN KEY ("casteId") REFERENCES "Caste" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "gender" TEXT,
    "dob" DATETIME,
    "motherTongue" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "incomeRange" TEXT,
    "city" TEXT,
    "state" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OtpChallenge_identifier_channel_idx" ON "OtpChallenge"("identifier", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Religion_name_key" ON "Religion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Caste_religionId_name_key" ON "Caste"("religionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SubCaste_casteId_name_key" ON "SubCaste"("casteId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
