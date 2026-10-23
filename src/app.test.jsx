// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
vi.mock('./hooks/useReservados', () => ({ useReservados: () => new Set() }));
import { FavoritesProvider } from './context/FavoritesContext';
import { CompareProvider } from './context/CompareContext';
import { AuthProvider } from './context/AuthContext';

let root, host;
let mobile = false;
const click = (el) => act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
const key = (value, options = {}) => act(() => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options })));
const button = (name) => [...document.querySelectorAll('button')].find((el) => el.getAttribute('aria-label') === name || el.textContent.trim() === name);
const mount = (path) => act(() => root.render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><FavoritesProvider><CompareProvider><App /></CompareProvider></FavoritesProvider></AuthProvider></MemoryRouter>));

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  mobile = false;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: mobile, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('scrollTo', vi.fn());
  localStorage.clear(); sessionStorage.clear();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

describe('navegación y comportamiento real de componentes', () => {
  it('contiene el foco del menú, cierra con Escape y lo devuelve al botón', () => {
    mount('/vehiculos');
    const opener = button('Abrir menú'); opener.focus(); click(opener);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.querySelector('main').hasAttribute('inert')).toBe(true);
    const last = [...dialog.querySelectorAll('a,button')].at(-1); last.focus(); key('Tab');
    expect(document.activeElement).toBe(button('Cerrar menú'));
    key('Escape');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.querySelector('main').hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });
  it('enfoca la búsqueda y permite volver al disparador', () => {
    mount('/vehiculos'); const opener = button('Buscar vehículos'); opener.focus(); click(opener);
    expect(document.activeElement.getAttribute('type')).toBe('search');
    key('Tab', { shiftKey: true });
    expect(document.activeElement).toBe(button('Cerrar búsqueda'));
    key('Escape'); expect(document.activeElement).toBe(opener);
  });
  it('hace inaccesibles los filtros móviles cerrados y los cierra con Escape', () => {
    mobile = true; mount('/vehiculos');
    expect(document.querySelector('#catalog-filters').hasAttribute('inert')).toBe(true);
    const opener = button('Filtros'); opener.focus(); click(opener);
    expect(document.querySelector('#catalog-filters').getAttribute('role')).toBe('dialog');
    expect(document.activeElement).toBe(button('Cerrar filtros'));
    key('Escape'); expect(document.activeElement).toBe(opener);
    expect(document.querySelector('#catalog-filters').hasAttribute('inert')).toBe(true);
  });
  it('permite seleccionar tres autos, limita el cuarto y abre la comparación', () => {
    mount('/vehiculos');
    click(button('Comparar Suzuki Swift')); click(button('Comparar Toyota Corolla')); click(button('Comparar Mazda 3'));
    expect(button('Comparar Kia Sportage').disabled).toBe(true);
    const link = [...document.querySelectorAll('a')].find((el) => el.textContent === 'Ver comparación'); click(link);
    expect(document.querySelector('table').textContent).toContain('Toyota Corolla');
    expect(document.querySelectorAll('thead th')).toHaveLength(4);
    click(button('Quitar Toyota Corolla del comparador'));
    expect(document.querySelectorAll('thead th')).toHaveLength(3);
  });
  it('carga comparaciones compartidas sin ids duplicados ni desconocidos', () => {
    mount('/comparar?ids=toyota-corolla,invalido,toyota-corolla,kia-sportage');
    expect(document.querySelectorAll('thead th')).toHaveLength(3);
    expect(JSON.parse(sessionStorage.getItem('tuerka:compare'))).toEqual(['toyota-corolla', 'kia-sportage']);
  });
  it('recupera favoritos corruptos sin romper la página ni inventar favoritos', () => {
    localStorage.setItem('tuerka:favorites', '{"length":2}'); mount('/favoritos');
    expect(document.querySelector('main').textContent).toContain('Aún no guardas vehículos');
    expect(JSON.parse(localStorage.getItem('tuerka:favorites'))).toEqual([]);
  });
  it('navega las pestañas de la ficha con flechas y End', () => {
    mount('/vehiculos/toyota-corolla');
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs[0].focus(); key('ArrowRight');
    expect(document.activeElement).toBe(tabs[1]); expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    key('End'); expect(document.activeElement).toBe(tabs[2]);
    expect(document.querySelector('#panel-2').hidden).toBe(false);
    expect(document.querySelector('#panel-0').hidden).toBe(true);
    expect(document.title).toContain('Toyota Corolla');
  });
  it.each(['/simulador?vehiculo=kia-sportage', '/ayuda', '/comparar', '/ruta-inexistente'])('renderiza la ruta %s sin perder título ni contenido', (path) => {
    mount(path); expect(document.querySelector('h1')).not.toBeNull(); expect(document.title).not.toContain('undefined');
  });
});
