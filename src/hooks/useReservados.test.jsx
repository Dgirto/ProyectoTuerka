// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/supabase', () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from '../lib/supabase';
import { refrescarReservados, useReservados } from './useReservados';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
  const ids = useReservados();
  return <output>{[...ids].join(',')}</output>;
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

describe('useReservados', () => {
  let root;
  let host;

  afterEach(() => {
    if (root) act(() => root.unmount());
    host?.remove();
    root = null;
    host = null;
    vi.clearAllMocks();
  });

  it('refresca suscriptores montados y descarta respuestas anteriores a la invalidación', async () => {
    const first = deferred();
    const second = deferred();
    supabase.rpc.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    host = document.createElement('div');
    root = createRoot(host);

    await act(async () => {
      root.render(<Probe />);
    });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);

    act(() => refrescarReservados());
    expect(supabase.rpc).toHaveBeenCalledTimes(2);

    await act(async () => {
      second.resolve({ data: ['actual'], error: null });
      await second.promise;
    });
    expect(host.textContent).toBe('actual');

    await act(async () => {
      first.resolve({ data: ['obsoleto'], error: null });
      await first.promise;
    });
    expect(host.textContent).toBe('actual');
  });
});
