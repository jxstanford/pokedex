import type { PokemonDetail as PokemonDetailType } from '../types/pokemon';

interface PokemonDetailProps {
  pokemon: PokemonDetailType | null;
}

const PokemonDetail = ({ pokemon }: PokemonDetailProps) => {
  if (!pokemon) {
    return <p className="text-sm text-slate-600">Select a Pokémon to view details.</p>;
  }

  const stats = pokemon.stats;

  return (
    <section className="space-y-4 rounded border p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pokemon.name}</h1>
          <p className="text-slate-600">Types: {pokemon.types.join(', ')}</p>
          {pokemon.description && <p className="mt-2 text-sm text-slate-700">{pokemon.description}</p>}
        </div>
        {pokemon.image_url && (
          <img src={pokemon.image_url} alt={pokemon.name} className="h-32 w-32 object-contain" />
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Vitals</h2>
          <ul className="text-sm text-slate-600">
            {pokemon.height && <li>Height: {pokemon.height} m</li>}
            {pokemon.weight && <li>Weight: {pokemon.weight} kg</li>}
            {pokemon.generation && <li>Generation: {pokemon.generation}</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Abilities</h2>
          <p className="text-sm text-slate-600">{pokemon.abilities?.join(', ') || 'Unknown'}</p>
        </div>
      </div>
      {stats && (
        <div>
          <h2 className="text-lg font-semibold">Stats</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <Stat label="HP" value={stats.hp} />
            <Stat label="Attack" value={stats.attack} />
            <Stat label="Defense" value={stats.defense} />
            <Stat label="Sp. Attack" value={stats.special_attack} />
            <Stat label="Sp. Defense" value={stats.special_defense} />
            <Stat label="Speed" value={stats.speed} />
          </dl>
        </div>
      )}
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <dt className="text-xs uppercase text-slate-500">{label}</dt>
    <dd className="font-semibold text-slate-800">{value}</dd>
  </div>
);

export default PokemonDetail;
