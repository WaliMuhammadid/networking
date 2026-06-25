import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the academy brand', () => {
    render(<App />);
    expect(screen.getByText('NetOps Academy')).toBeInTheDocument();
  });

  it('renders Course Syllabus tab button', () => {
    render(<App />);
    expect(screen.getByText('Course Syllabus')).toBeInTheDocument();
  });

  it('renders Network Sandbox Simulator tab button', () => {
    render(<App />);
    expect(screen.getByText('Network Sandbox Simulator')).toBeInTheDocument();
  });

  it('displays Course Progress tracker', () => {
    render(<App />);
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it('renders the module navigation sidebar', () => {
    render(<App />);
    expect(screen.getAllByText(/Ports & Packet Routing/i).length).toBeGreaterThan(0);
  });
});