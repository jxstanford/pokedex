import { render, screen } from "@testing-library/react";
import { ResultsView } from "../ResultsView";
import type { PokemonMatch } from "../../types";

const matches: PokemonMatch[] = [
  {
    id: 6,
    name: "Charizard",
    similarity: 92,
    types: ["fire", "flying"],
    imageUrl: "https://example.com/charizard.png",
    description: "Flame Pokémon",
    height: "1.7 m",
    weight: "90.5 kg",
    generation: 1,
    abilities: ["Blaze"],
    stats: {
      hp: 78,
      attack: 84,
      defense: 78,
      spAttack: 109,
      spDefense: 85,
      speed: 100,
    },
  },
];

describe("ResultsView", () => {
  it("renders matches with similarity and types", () => {
    render(<ResultsView matches={matches} onPokemonSelect={() => {}} previewUrl="preview.png" />);

    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("fire")).toBeInTheDocument();
    expect(screen.getByText("flying")).toBeInTheDocument();
    expect(screen.getByAltText("Charizard")).toHaveAttribute("src", "https://example.com/charizard.png");
  });
});
