// Dummy-komponent som holder plassen til en side eller seksjon som ikke er laget ennå
export function Placeholder({ title }: { title: string }) {
  return (
    <section className="placeholder" aria-label={title}>
      <h2>{title}</h2>
      <p>Kommer snart.</p>
    </section>
  )
}
