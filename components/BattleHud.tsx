export default function BattleHud({
  boss,
  threat,
  phase,
}: {
  boss: string
  threat: number
  phase: string
}) {
  return (
    <section className="battle-hud">
      <div className="battle-top">
        <div>
          <div className="battle-label">異常威脅</div>
          <div className="battle-boss">{boss}</div>
        </div>

        <div className="battle-phase">
          {phase}
        </div>
      </div>

      <div className="battle-bar-bg">
        <div
          className="battle-bar-fill"
          style={{ width: `${threat}%` }}
        />
      </div>

      <div className="battle-threat">
        Threat Level：{threat}%
      </div>
    </section>
  )
}
