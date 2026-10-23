CREATE TABLE "OnboardingDraft" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "step" INTEGER NOT NULL DEFAULT 0,
 "data" JSONB NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "OnboardingDraft_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OnboardingDraft_userId_key" ON "OnboardingDraft"("userId");
ALTER TABLE "OnboardingDraft" ADD CONSTRAINT "OnboardingDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
