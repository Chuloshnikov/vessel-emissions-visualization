'use client'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DeviationChart() {
  const { data, error } = useSWR('/api/deviations', fetcher)

  if (error) return <div>Error loading data</div>
  if (!data) return <div>Loading...</div>

  // Собираем уникальные кварталы
  const allQuarters = Array.from(
    new Set(
      data.flatMap((vessel: any) =>
        (vessel.deviations ?? []).map((d: any) => d.quarter)
      )
    )
  ).sort()

  // Строим series по каждому vessel
  const series = data.map((vessel: any) => ({
    type: 'line' as const,
    name: vessel.vesselName,
    data: allQuarters.map((q) => {
      const deviationEntry = (vessel.deviations ?? []).find(
        (d: any) => d.quarter === q
      )
      return deviationEntry ? deviationEntry.deviation : null
    }),
  }))

  const options: Highcharts.Options = {
    title: { text: 'Vessel Emissions Deviation' },
    xAxis: { categories: allQuarters },
    yAxis: { title: { text: 'Deviation %' } },
    series,
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}