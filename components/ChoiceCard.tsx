export default function ChoiceCard({
  title,
  desc,
  danger,
}: {
  title: string
  desc: string
  danger?: boolean
}) {
  return (
    <button className={`choice-rpg-card ${danger ? 'danger' : ''}`}>
      <div className="choice-title">{title}</div>
      <div className="choice-desc">{desc}</div>
    </button>
  )
}
