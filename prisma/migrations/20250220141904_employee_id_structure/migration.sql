-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "excluded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "drawNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_employeeId_key" ON "Participant"("employeeId");

-- CreateIndex
CREATE INDEX "Winner_round_idx" ON "Winner"("round");
