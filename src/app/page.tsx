import DeviationChart from '@/components/DeviationChart'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Vessel Emissions Deviation</h1>
      <DeviationChart />
    </main>
  )
}