export default function SystemWarning({
  warnings,
}: {
  warnings: string[]
}) {
  if (warnings.length === 0) return null

  return (
    <section className="warning-card">
      <div className="warning-title">系統警告</div>

      {warnings.map((warning) => (
        <div className="warning-line" key={warning}>
          ⚠ {warning}
        </div>
      ))}
    </section>
  )
}
