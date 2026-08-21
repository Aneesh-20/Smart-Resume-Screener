import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '../components/common/ScoreBadge';

describe('ScoreBadge Component', () => {
  it('renders fit score accurately on 10.0 scale', () => {
    render(<ScoreBadge score={8.5} showMax={true} />);
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();
  });

  it('renders without /10 suffix when showMax is false', () => {
    render(<ScoreBadge score={9.0} showMax={false} />);
    expect(screen.getByText('9.0')).toBeInTheDocument();
    expect(screen.queryByText('/10')).not.toBeInTheDocument();
  });
});
