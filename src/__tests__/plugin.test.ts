import { chart2text } from '../plugin';

describe('chart2text plugin', () => {
  describe('plugin structure', () => {
    it('should have correct plugin id', () => {
      expect(chart2text.id).toBe('chart2text');
    });

    it('should define beforeInit hook', () => {
      expect(chart2text.beforeInit).toBeDefined();
      expect(typeof chart2text.beforeInit).toBe('function');
    });

    it('should define afterUpdate hook', () => {
      expect(chart2text.afterUpdate).toBeDefined();
      expect(typeof chart2text.afterUpdate).toBe('function');
    });

    it('should define afterDestroy hook', () => {
      expect(chart2text.afterDestroy).toBeDefined();
      expect(typeof chart2text.afterDestroy).toBe('function');
    });
  });

  describe('beforeInit hook', () => {
    it('should set aria-describedby attribute on canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';

      const mockChart = {
        canvas,
        options: {},
        data: { datasets: [] }
      } as any;

      chart2text.beforeInit?.(mockChart, {}, {});

      expect(canvas.getAttribute('aria-describedby')).toBe('test-chart-description');
    });

    it('should generate id for canvas if missing', () => {
      const canvas = document.createElement('canvas');

      const mockChart = {
        canvas,
        options: {},
        data: { datasets: [] }
      } as any;

      chart2text.beforeInit?.(mockChart, {}, {});

      expect(canvas.id).toBeTruthy();
      expect(canvas.id).toMatch(/^chart-/);
    });
  });

  describe('afterUpdate hook', () => {
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);
    });

    afterEach(() => {
      canvas.remove();
      const desc = document.getElementById('test-chart-description');
      if (desc) {
        desc.remove();
      }
    });

    it('should create description element', () => {
      const mockChart = {
        canvas,
        options: {
          plugins: {
            title: { text: 'Test Chart' }
          }
        },
        data: {
          labels: ['A', 'B'],
          datasets: [{
            label: 'Test',
            data: [10, 20]
          }]
        },
        config: {
          type: 'bar'
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      const descElement = document.getElementById('test-chart-description');
      expect(descElement).not.toBeNull();
      expect(descElement?.classList.contains('visually-hidden')).toBe(true);
      expect(descElement?.getAttribute('tabindex')).toBe('0');
    });

    it('should set ARIA attributes on canvas', () => {
      const mockChart = {
        canvas,
        options: {
          plugins: {
            title: { text: 'My Chart' }
          }
        },
        data: {
          labels: ['A', 'B'],
          datasets: [{
            label: 'Test',
            data: [10, 20]
          }]
        },
        config: {
          type: 'bar'
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      expect(canvas.getAttribute('role')).toBe('img');
      expect(canvas.getAttribute('aria-label')).toContain('My Chart');
    });

    it('should not create description when disabled', () => {
      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['A', 'B'],
          datasets: [{
            label: 'Test',
            data: [10, 20]
          }]
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, { enabled: false });

      const descElement = document.getElementById('test-chart-description');
      expect(descElement).toBeNull();
    });

    it('should handle charts with no datasets', () => {
      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: [],
          datasets: []
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      // Should not crash, but won't create description for empty chart
      const descElement = document.getElementById('test-chart-description');
      expect(descElement).toBeNull();
    });

    it('should generate description with combineStacks option', () => {
      const mockChart = {
        canvas,
        options: {
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        },
        data: {
          labels: ['Q1', 'Q2'],
          datasets: [
            {
              label: 'Product A',
              data: [10, 20]
            },
            {
              label: 'Product B',
              data: [5, 15]
            }
          ]
        },
        config: {
          type: 'bar'
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, { combineStacks: true });

      const descElement = document.getElementById('test-chart-description');
      const description = descElement?.textContent || '';

      // Should not mention individual products when combined
      expect(description).not.toContain('Product A:');
      expect(description).not.toContain('Product B:');
    });

    it('should describe datasets separately without combineStacks', () => {
      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['Q1', 'Q2'],
          datasets: [
            {
              label: 'Product A',
              data: [10, 20]
            },
            {
              label: 'Product B',
              data: [5, 15]
            }
          ]
        },
        config: {
          type: 'bar'
        }
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, { combineStacks: false });

      const descElement = document.getElementById('test-chart-description');
      const description = descElement?.textContent || '';

      // Should mention both products
      expect(description).toContain('Product A');
      expect(description).toContain('Product B');
    });
  });

  describe('afterDestroy hook', () => {
    it('should remove description element', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);

      // Create a description element
      const desc = document.createElement('div');
      desc.id = 'test-chart-description';
      canvas.parentNode?.insertBefore(desc, canvas.nextSibling);

      const mockChart = {
        canvas,
        options: {},
        data: { datasets: [] }
      } as any;

      chart2text.afterDestroy?.(mockChart, {}, {});

      expect(document.getElementById('test-chart-description')).toBeNull();

      canvas.remove();
    });

    it('should remove ARIA attributes from canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      canvas.setAttribute('aria-describedby', 'test-chart-description');
      canvas.setAttribute('aria-label', 'Test');
      canvas.setAttribute('role', 'img');
      document.body.appendChild(canvas);

      const mockChart = {
        canvas,
        options: {},
        data: { datasets: [] }
      } as any;

      chart2text.afterDestroy?.(mockChart, {}, {});

      expect(canvas.getAttribute('aria-describedby')).toBeNull();
      expect(canvas.getAttribute('aria-label')).toBeNull();
      expect(canvas.getAttribute('role')).toBeNull();

      canvas.remove();
    });
  });
});
