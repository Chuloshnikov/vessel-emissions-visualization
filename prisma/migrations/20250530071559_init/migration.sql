-- CreateTable
CREATE TABLE "Vessel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imoNo" INTEGER NOT NULL,
    "vesselType" INTEGER NOT NULL,
    "dwt" DOUBLE PRECISION NOT NULL DEFAULT 50000,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLogEmission" (
    "id" SERIAL NOT NULL,
    "eid" INTEGER NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "logId" BIGINT NOT NULL,
    "fromUTC" TIMESTAMP(3) NOT NULL,
    "toUTC" TIMESTAMP(3) NOT NULL,
    "aerco2t2w" DOUBLE PRECISION NOT NULL,
    "aerco2eW2w" DOUBLE PRECISION NOT NULL,
    "eeoico2eW2w" DOUBLE PRECISION NOT NULL,
    "totT2wco2" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLogEmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPReference" (
    "id" SERIAL NOT NULL,
    "rowId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "vesselTypeId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "traj" TEXT NOT NULL,
    "a" DOUBLE PRECISION NOT NULL,
    "b" DOUBLE PRECISION NOT NULL,
    "c" DOUBLE PRECISION NOT NULL,
    "d" DOUBLE PRECISION NOT NULL,
    "e" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PPReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imoNo_key" ON "Vessel"("imoNo");

-- AddForeignKey
ALTER TABLE "DailyLogEmission" ADD CONSTRAINT "DailyLogEmission_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("imoNo") ON DELETE RESTRICT ON UPDATE CASCADE;
