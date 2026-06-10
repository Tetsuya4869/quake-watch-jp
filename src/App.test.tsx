import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';

// EarthquakeMap uses Mapbox GL which requires a real WebGL context.
// Mock it so App tests stay focused on data-fetching and rendering logic.
vi.mock('./components/EarthquakeMap', () => ({
  default: ({ quakes }: { quakes: { id: string }[] }) => (
    <div data-testid="earthquake-map" data-quake-count={quakes.length} />
  ),
}));

const mockApiResponse = [
  {
    _id: 'quake-001',
    earthquake: {
      time: '2024/01/15 14:30:00',
      maxIntensity: 40,
      hypocenter: {
        name: '茨城県南部',
        magnitude: 4.2,
        latitude: 36.1,
        longitude: 140.1,
      },
    },
  },
  {
    _id: 'quake-002',
    earthquake: {
      time: '2024/01/15 10:00:00',
      maxIntensity: 55,
      hypocenter: {
        name: '福島県沖',
        magnitude: 5.8,
        latitude: 37.5,
        longitude: 141.2,
      },
    },
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App', () => {
  describe('loading state', () => {
    it('shows loading indicator before fetch completes', () => {
      // fetch that never resolves — loading state persists
      vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
      render(<App />);
      expect(screen.getByText('Loading live data...')).toBeInTheDocument();
    });
  });

  describe('loaded state', () => {
    it('renders quake cards after a successful fetch', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      expect(screen.getByText('茨城県南部')).toBeInTheDocument();
      expect(screen.getByText('福島県沖')).toBeInTheDocument();
    });

    it('displays the correct intensity for each quake', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      // intensity 40 → '4', intensity 55 → '6弱'
      expect(screen.getByText('震度 4')).toBeInTheDocument();
      expect(screen.getByText('震度 6弱')).toBeInTheDocument();
    });

    it('applies red badge class for magnitude > 5', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      // quake-002 has magnitude 5.8 > 5 → red badge
      const badge = screen.getByText('M5.8');
      expect(badge.className).toMatch(/bg-red-500/);
    });

    it('applies blue badge class for magnitude ≤ 5', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      // quake-001 has magnitude 4.2 ≤ 5 → blue badge
      const badge = screen.getByText('M4.2');
      expect(badge.className).toMatch(/bg-blue-500/);
    });

    it('passes quakes to the map component', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      const map = screen.getByTestId('earthquake-map');
      expect(map.getAttribute('data-quake-count')).toBe('2');
    });
  });

  describe('date string normalization', () => {
    it('renders without crashing when API time uses "/" separators', async () => {
      // The raw API returns "2024/01/15 14:30:00" — App replaces "/" with "-"
      // before passing to date-fns. If this breaks, the component throws.
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await act(async () => { render(<App />); });

      // If date normalization fails, an error would be thrown during render
      expect(screen.getByText('茨城県南部')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows an error message and retry button when fetch throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => { render(<App />); });

      expect(screen.queryByText('Loading live data...')).not.toBeInTheDocument();
      expect(screen.getByText('地震情報の取得に失敗しました')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /再試行/ })).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('shows an error when the API responds with a non-OK status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 503,
      } as Response);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => { render(<App />); });

      expect(screen.getByText('地震情報の取得に失敗しました')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('refetches and recovers when the retry button is clicked', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => { render(<App />); });
      expect(screen.getByText('地震情報の取得に失敗しました')).toBeInTheDocument();

      await act(async () => {
        screen.getByRole('button', { name: /再試行/ }).click();
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText('茨城県南部')).toBeInTheDocument();
      expect(screen.queryByText('地震情報の取得に失敗しました')).not.toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('keeps showing stale data with a warning when a later poll fails', async () => {
      vi.useFakeTimers();
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        } as Response)
        .mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => { render(<App />); });
      expect(screen.getByText('茨城県南部')).toBeInTheDocument();

      // 60秒後のポーリングが失敗
      await act(async () => {
        vi.advanceTimersByTime(60000);
      });

      // 取得済みデータは残したまま、警告バナーを表示する
      expect(screen.getByText('茨城県南部')).toBeInTheDocument();
      expect(screen.getByText(/前回取得したデータを表示しています/)).toBeInTheDocument();

      consoleSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('empty state', () => {
    it('shows an empty message when the API returns no quakes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await act(async () => { render(<App />); });

      expect(screen.getByText('表示できる地震情報がありません')).toBeInTheDocument();
    });
  });

  describe('polling', () => {
    it('sets up a 60-second polling interval', async () => {
      vi.useFakeTimers();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      render(<App />);

      // Flush the initial fetch microtasks
      await act(async () => { await Promise.resolve(); });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Advance by 60 seconds — should trigger a second fetch
      await act(async () => {
        vi.advanceTimersByTime(60000);
        await Promise.resolve();
      });
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('clears the interval on unmount to prevent memory leaks', async () => {
      vi.useFakeTimers();
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const { unmount } = render(<App />);
      await act(async () => { await Promise.resolve(); });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
