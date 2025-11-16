import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../../src/pages/Home';

const renderHome = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('Home page', () => {
  it('renders title', () => {
    renderHome();
    expect(screen.getByText(/Pokémon Vision/i)).toBeInTheDocument();
  });
});
