import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MatchResults from '../../src/components/MatchResults';

const matches = [
  {
    pokemon: { id: 25, name: 'Pikachu', types: ['electric'] },
    similarity_score: 0.95,
    rank: 1,
  },
  {
    pokemon: { id: 6, name: 'Charizard', types: ['fire', 'flying'] },
    similarity_score: 0.7,
    rank: 2,
  },
];

describe('MatchResults', () => {
  it('renders loading state', () => {
    render(
      <MemoryRouter>
        <MatchResults matches={[]} isLoading />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty message when no matches', () => {
    render(
      <MemoryRouter>
        <MatchResults matches={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/upload a photo/i)).toBeInTheDocument();
  });

  it('renders matches sorted by score', () => {
    render(
      <MemoryRouter>
        <MatchResults matches={matches} />
      </MemoryRouter>,
    );
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Pikachu');
    expect(headings[1]).toHaveTextContent('Charizard');
  });
});
