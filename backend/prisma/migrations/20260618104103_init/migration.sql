-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TacticalReport" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "keyMoments" TEXT[],
    "standoutPlayers" TEXT[],
    "teamAnalysis" TEXT NOT NULL,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TacticalReport_matchId_key" ON "TacticalReport"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedReport_userId_matchId_key" ON "SavedReport"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "TacticalReport" ADD CONSTRAINT "TacticalReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
