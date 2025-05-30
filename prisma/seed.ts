import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1 Import vessels.json
  const vesselsRaw = await fs.readFile(path.join(__dirname, 'data', 'vessels.json'), 'utf-8')
  const vessels = JSON.parse(vesselsRaw)

  for (const vessel of vessels) {
    await prisma.vessel.upsert({
      where: { imoNo: vessel.IMONo },
      update: {},
      create: {
        name: vessel.Name,
        imoNo: vessel.IMONo,
        vesselType: vessel.VesselType,
        dwt: 50000, // Заглушка DWT —> см. комментарий в schema.prisma
      },
    })
  }

  console.log(`Inserted ${vessels.length} vessels.`)

  // 2️ Import pp-reference.json
  const ppRefRaw = await fs.readFile(path.join(__dirname, 'data', 'pp-reference.json'), 'utf-8')
  const ppRefs = JSON.parse(ppRefRaw)

  for (const ref of ppRefs) {
    await prisma.pPReference.create({
      data: {
        rowId: ref.RowID,
        category: ref.Category?.trim().toUpperCase(),
        vesselTypeId: ref.VesselTypeID,
        size: ref.Size?.trim(),
        traj: ref.Traj?.trim().toUpperCase(),
        a: ref.a,
        b: ref.b,
        c: ref.c,
        d: ref.d,
        e: ref.e,
      },
    })
  }

  console.log(`Inserted ${ppRefs.length} PPReference records.`)

  // 3️ Import daily-log-emissions.json
  const logsRaw = await fs.readFile(path.join(__dirname, 'data', 'daily-log-emissions.json'), 'utf-8')
  const logs = JSON.parse(logsRaw)

  for (const log of logs) {
    await prisma.dailyLogEmission.create({
      data: {
        eid: log.EID,
        vesselId: log.VesselID,
        logId: BigInt(log.LOGID),
        fromUTC: new Date(log.FromUTC),
        toUTC: new Date(log.TOUTC),
        aerco2t2w: log.AERCO2T2W,
        aerco2eW2w: log.AERCO2eW2W,
        eeoico2eW2w: log.EEOICO2eW2W,
        totT2wco2: log.TotT2WCO2,
        createdAt: new Date(log.CreatedAt),
        updatedAt: new Date(log.UpdatedAt),
      },
    })
  }

  console.log(`Inserted ${logs.length} daily log emissions.`)

  console.log('Seeding completed!!!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })