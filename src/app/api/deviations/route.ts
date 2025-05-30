import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Decimal from 'decimal.js'
import { calculatePPSCCBaselines } from '@/lib/calculatePPSCC'
import { endOfQuarter, getYear } from 'date-fns'

const prisma = new PrismaClient()

export async function GET() {
  const vessels = await prisma.vessel.findMany({
    include: {
      dailyLogs: true,
    },
  })

  const ppRefs = await prisma.pPReference.findMany()

  const data = vessels.map(vessel => {
    const logs = vessel.dailyLogs

    const logsByQuarter = groupLogsByQuarter(logs)

    const deviations = Object.entries(logsByQuarter)
      .map(([quarter, logsInQuarter]) => {
        const lastLog = getLastLogInQuarter(logsInQuarter)

        if (!lastLog) {
          return null
        }

        const factors = ppRefs
          .filter(ref => ref.vesselTypeId === vessel.vesselType)
          .map(ref => ({
            traj: ref.traj,
            a: ref.a,
            b: ref.b,
            c: ref.c,
            d: ref.d,
            e: ref.e,
          }))

        const baseline = calculatePPSCCBaselines({
          factors,
          year: getYear(lastLog.toUTC),
          DWT: new Decimal(vessel.dwt),
        })

        if (!baseline.min || baseline.min.toNumber() === 0) {
          console.warn(
            'Skipping deviation due to zero baseline:',
            vessel.name,
            quarter
          )
          return null
        }

        const deviation =
          ((lastLog.aerco2t2w - baseline.min.toNumber()) /
            baseline.min.toNumber()) *
          100

        return {
          quarter,
          deviation,
        }
      })
      .filter(Boolean)

    return {
      vesselName: vessel.name,
      deviations,
    }
  })

  return NextResponse.json(data)
}

function groupLogsByQuarter(logs: any[]) {
  const grouped: Record<string, any[]> = {}

  for (const log of logs) {
    const qEnd = endOfQuarter(new Date(log.toUTC))
    const key = `${qEnd.getFullYear()} Q${Math.ceil(
      (qEnd.getMonth() + 1) / 3
    )}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(log)
  }

  return grouped
}

function getLastLogInQuarter(logs: any[]) {
  return logs.sort(
    (a, b) => new Date(b.toUTC).getTime() - new Date(a.toUTC).getTime()
  )[0]
}