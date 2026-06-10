import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted runs before module imports, so variables defined here
// are available inside the vi.mock factory below (which is also hoisted).
const { mockMapInstance, mockMarkerInstance, mockPopupInstance } = vi.hoisted(() => {
  const mockMarkerInstance = {
    setLngLat: vi.fn(),
    setPopup: vi.fn(),
    addTo: vi.fn(),
    remove: vi.fn(),
  };
  const mockPopupInstance = {
    setHTML: vi.fn(),
  };
  const mockMapInstance = {
    addControl: vi.fn(),
    remove: vi.fn(),
  };
  return { mockMapInstance, mockMarkerInstance, mockPopupInstance };
});

// Mapbox GL requires WebGL — mock the whole module.
// Must use regular functions (not arrows) so `new mapboxgl.Map(...)` works.
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(function () { return mockMapInstance; }),
    Marker: vi.fn(function () { return mockMarkerInstance; }),
    Popup: vi.fn(function () { return mockPopupInstance; }),
    NavigationControl: vi.fn(function () {}),
  },
}));

vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

import EarthquakeMap from './EarthquakeMap';

const sampleQuakes = [
  { id: 'q1', time: '2024-01-15 14:30:00', magnitude: 4.2, maxIntensity: '4', hypocenter: '茨城県南部', lat: 36.1, lng: 140.1 },
  { id: 'q2', time: '2024-01-15 10:00:00', magnitude: 5.8, maxIntensity: '6弱', hypocenter: '福島県沖', lat: 37.5, lng: 141.2 },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockMarkerInstance.setLngLat.mockReturnValue(mockMarkerInstance);
  mockMarkerInstance.setPopup.mockReturnValue(mockMarkerInstance);
  mockMarkerInstance.addTo.mockReturnValue(mockMarkerInstance);
  mockPopupInstance.setHTML.mockReturnValue(mockPopupInstance);
});

describe('EarthquakeMap', () => {
  it('renders a container div', () => {
    const { container } = render(<EarthquakeMap quakes={[]} />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('initialises a Mapbox map on mount', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    render(<EarthquakeMap quakes={[]} />);
    expect(mapboxgl.Map).toHaveBeenCalledOnce();
  });

  it('does not initialise a second map on re-render', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    const { rerender } = render(<EarthquakeMap quakes={[]} />);
    rerender(<EarthquakeMap quakes={[]} />);
    expect(mapboxgl.Map).toHaveBeenCalledTimes(1);
  });

  it('adds a NavigationControl to the map', () => {
    render(<EarthquakeMap quakes={[]} />);
    expect(mockMapInstance.addControl).toHaveBeenCalledWith(
      expect.any(Object),
      'top-right'
    );
  });

  it('creates one Marker per quake', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    render(<EarthquakeMap quakes={sampleQuakes} />);
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(sampleQuakes.length);
  });

  it('positions each marker at the correct coordinates', () => {
    render(<EarthquakeMap quakes={sampleQuakes} />);
    expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([140.1, 36.1]);
    expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([141.2, 37.5]);
  });

  it('calculates marker size as max(20, magnitude × 10)', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    render(<EarthquakeMap quakes={[
      { id: 'small', time: '', magnitude: 1, maxIntensity: '1', hypocenter: 'A', lat: 35, lng: 135 },
      { id: 'large', time: '', magnitude: 6, maxIntensity: '6弱', hypocenter: 'B', lat: 36, lng: 136 },
    ]} />);

    const calls = (mapboxgl.Marker as ReturnType<typeof vi.fn>).mock.calls;
    // magnitude 1 → max(20, 10) = 20px
    expect(calls[0][0].style.width).toBe('20px');
    // magnitude 6 → max(20, 60) = 60px
    expect(calls[1][0].style.width).toBe('60px');
  });

  it('sets popup HTML with hypocenter name and magnitude', () => {
    render(<EarthquakeMap quakes={[sampleQuakes[0]]} />);
    expect(mockPopupInstance.setHTML).toHaveBeenCalledWith(
      expect.stringContaining('茨城県南部')
    );
    expect(mockPopupInstance.setHTML).toHaveBeenCalledWith(
      expect.stringContaining('M4.2')
    );
  });

  it('escapes HTML in the popup to prevent XSS', () => {
    render(<EarthquakeMap quakes={[
      { ...sampleQuakes[0], hypocenter: '<img src=x onerror=alert(1)>' },
    ]} />);
    const html = mockPopupInstance.setHTML.mock.calls[0][0] as string;
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('removes existing markers via the Mapbox API when quakes change', () => {
    const { rerender } = render(<EarthquakeMap quakes={[sampleQuakes[0]]} />);
    expect(mockMarkerInstance.remove).not.toHaveBeenCalled();

    rerender(<EarthquakeMap quakes={sampleQuakes} />);
    // 1個目のレンダーで作られたマーカーが破棄される
    expect(mockMarkerInstance.remove).toHaveBeenCalledTimes(1);
  });

  it('sets an aria-label on each marker for accessibility', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    render(<EarthquakeMap quakes={[sampleQuakes[0]]} />);
    const el = (mapboxgl.Marker as ReturnType<typeof vi.fn>).mock.calls[0][0] as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('茨城県南部 マグニチュード4.2 震度4');
  });

  it('keeps the quake-marker class so hover styles apply', async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    render(<EarthquakeMap quakes={[sampleQuakes[0]]} />);
    const el = (mapboxgl.Marker as ReturnType<typeof vi.fn>).mock.calls[0][0] as HTMLElement;
    expect(el.classList.contains('quake-marker')).toBe(true);
    expect(el.classList.contains('animate-pulse')).toBe(true);
  });

  it('removes the map on unmount', () => {
    const { unmount } = render(<EarthquakeMap quakes={[]} />);
    unmount();
    expect(mockMapInstance.remove).toHaveBeenCalledTimes(1);
  });
});
