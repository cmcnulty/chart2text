import type { Plugin } from 'chart.js';
import { chart2text } from '../plugin';

describe('chart2text plugin', () => {
  describe('plugin structure', () => {
    it('should have correct plugin id', () => {
      expect(chart2text.id).toBe('chart2text');
    });

    it('should be typed exactly as Chart.js plugin lists expect', () => {
      // Compile-time check (ts-jest type-checks tests). A narrower type, like
      // Plugin<'line' | 'bar' | 'pie', Chart2TextOptions>, made TypeScript's acceptance of `plugins: [chart2text]`
      // depend on the order it checked files in, so require the exact type rather than mere assignability.
      type Equals<A, B> =
        (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
      const isPlainPlugin: Equals<typeof chart2text, Plugin> = true;
      expect(isPlainPlugin).toBe(true);
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
        },
        isDatasetVisible: jest.fn(() => true)
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      const descElement = document.getElementById('test-chart-description');
      expect(descElement).not.toBeNull();
      expect(descElement?.classList.contains('visually-hidden')).toBe(true);
      // Reached via aria-describedby; it should not be an extra tab stop
      expect(descElement?.hasAttribute('tabindex')).toBe(false);
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
        },
        isDatasetVisible: jest.fn(() => true)
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
        },
        isDatasetVisible: jest.fn(() => true)
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
        },
        isDatasetVisible: jest.fn(() => true)
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, { combineStacks: false });

      const descElement = document.getElementById('test-chart-description');
      const description = descElement?.textContent || '';

      // Should mention both products
      expect(description).toContain('Product A');
      expect(description).toContain('Product B');
    });

    it('should exclude hidden datasets from description', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);

      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['Q1', 'Q2'],
          datasets: [
            { label: 'Product A', data: [10, 20] },
            { label: 'Product B', data: [5, 15] },
            { label: 'Product C', data: [8, 12] }
          ]
        },
        config: { type: 'bar' },
        isDatasetVisible: jest.fn((index) => index !== 1) // Product B (index 1) is hidden
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      const descElement = document.getElementById('test-chart-description');
      const description = descElement?.textContent || '';

      // Should include visible datasets
      expect(description).toContain('Product A');
      expect(description).toContain('Product C');

      // Should NOT include hidden dataset
      expect(description).not.toContain('Product B');

      canvas.remove();
      descElement?.remove();
    });

    it('should update multi-dataset introduction when dataset is hidden', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);

      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['Q1', 'Q2'],
          datasets: [
            { label: 'Revenue', data: [100, 120] },
            { label: 'Expenses', data: [80, 90] },
            { label: 'Profit', data: [20, 30] }
          ]
        },
        config: { type: 'line' },
        isDatasetVisible: jest.fn((index) => index !== 1) // Expenses (index 1) is hidden
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, { multiDatasetIntroduction: true });

      const descElement = document.getElementById('test-chart-description');
      const description = descElement?.textContent || '';

      // Should say "2 data series" not "3 data series"
      expect(description).toContain('2 data series');
      expect(description).not.toContain('3 data series');

      // Should list only visible datasets in introduction
      expect(description).toMatch(/Revenue.*Profit/);
      expect(description).not.toContain('Expenses');

      canvas.remove();
      descElement?.remove();
    });

    it('should update description when dataset visibility changes', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);

      let isDataset1Visible = true;

      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['Q1', 'Q2'],
          datasets: [
            { label: 'Product A', data: [10, 20] },
            { label: 'Product B', data: [5, 15] }
          ]
        },
        config: { type: 'bar' },
        isDatasetVisible: jest.fn((index) => index === 0 || isDataset1Visible)
      } as any;

      // First render - all datasets visible
      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      let descElement = document.getElementById('test-chart-description');
      let description = descElement?.textContent || '';

      expect(description).toContain('Product A');
      expect(description).toContain('Product B');

      // Simulate hiding Product B (user clicks legend)
      isDataset1Visible = false;

      // Chart.js calls update(), which triggers afterUpdate
      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      descElement = document.getElementById('test-chart-description');
      description = descElement?.textContent || '';

      // Description should now exclude Product B
      expect(description).toContain('Product A');
      expect(description).not.toContain('Product B');

      canvas.remove();
      descElement?.remove();
    });

    it('should exclude hidden slices from pie chart description', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'test-pie-chart';
      document.body.appendChild(canvas);

      const mockChart = {
        canvas,
        options: {},
        data: {
          labels: ['Marketing', 'Development', 'Sales', 'Operations'],
          datasets: [{
            label: 'Department Budget',
            data: [45000, 120000, 85000, 60000]
          }]
        },
        config: { type: 'pie' },
        isDatasetVisible: jest.fn(() => true),
        getDataVisibility: jest.fn((index) => index !== 2) // Sales (index 2) is hidden
      } as any;

      chart2text.afterUpdate?.(mockChart, { mode: "default" as const }, {});

      const descElement = document.getElementById('test-pie-chart-description');
      const description = descElement?.textContent || '';

      // Should include visible slices
      expect(description).toContain('Marketing');
      expect(description).toContain('Development');
      expect(description).toContain('Operations');

      // Should NOT include hidden slice
      expect(description).not.toContain('Sales');

      canvas.remove();
      descElement?.remove();
    });
  });

  describe('canvas aria-label and role ownership', () => {
    let canvas: HTMLCanvasElement;

    const makeChart = (extra: any = {}) => ({
      canvas,
      options: { plugins: { title: { text: 'My Chart' } } },
      data: {
        labels: ['A', 'B'],
        datasets: [{ label: 'Test', data: [10, 20] }]
      },
      config: { type: 'bar' },
      isDatasetVisible: jest.fn(() => true),
      ...extra
    } as any);

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);
    });

    afterEach(() => {
      canvas.remove();
      document.getElementById('test-chart-description')?.remove();
    });

    it('should not overwrite an aria-label or role set by the author or another plugin', () => {
      canvas.setAttribute('aria-label', 'Author label');
      canvas.setAttribute('role', 'application');
      const chart = makeChart();

      chart2text.beforeInit?.(chart, {}, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});

      expect(canvas.getAttribute('aria-label')).toBe('Author label');
      expect(canvas.getAttribute('role')).toBe('application');
      expect(canvas.getAttribute('aria-describedby')).toBe('test-chart-description');
    });

    it('should keep updating its own aria-label across updates', () => {
      const chart = makeChart();

      chart2text.beforeInit?.(chart, {}, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});
      chart.options.plugins.title.text = 'Renamed';
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});

      expect(canvas.getAttribute('aria-label')).toBe('Renamed with 1 data series.');
    });

    it('should build the aria-label from the chartLabel and untitledChart templates', () => {
      const chart = makeChart({ options: {} });
      const options = {
        templates: {
          general: {
            chartLabel: '{title} con {count} series de datos.',
            untitledChart: 'Gráfico'
          }
        }
      };

      chart2text.beforeInit?.(chart, {}, options);
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, options);

      expect(canvas.getAttribute('aria-label')).toBe('Gráfico con 1 series de datos.');
    });
  });

  describe('afterDestroy hook', () => {
    let canvas: HTMLCanvasElement;

    const makeChart = () => ({
      canvas,
      options: { plugins: { title: { text: 'Test' } } },
      data: {
        labels: ['A', 'B'],
        datasets: [{ label: 'Test', data: [10, 20] }]
      },
      config: { type: 'bar' },
      isDatasetVisible: jest.fn(() => true)
    } as any);

    // Mirrors Chart.js's destroy(), which nulls chart.canvas before afterDestroy
    const destroy = (chart: any) => {
      chart.canvas = null;
      chart2text.afterDestroy?.(chart, {}, {});
    };

    beforeEach(() => {
      canvas = document.createElement('canvas');
      canvas.id = 'test-chart';
      document.body.appendChild(canvas);
    });

    afterEach(() => {
      canvas.remove();
    });

    it('should remove description element even though chart.canvas is null', () => {
      const chart = makeChart();
      chart2text.beforeInit?.(chart, {}, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});
      expect(document.getElementById('test-chart-description')).not.toBeNull();

      expect(() => destroy(chart)).not.toThrow();

      expect(document.getElementById('test-chart-description')).toBeNull();
    });

    it('should remove the ARIA attributes it set', () => {
      const chart = makeChart();
      chart2text.beforeInit?.(chart, {}, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});

      destroy(chart);

      expect(canvas.getAttribute('aria-describedby')).toBeNull();
      expect(canvas.getAttribute('aria-label')).toBeNull();
      expect(canvas.getAttribute('role')).toBeNull();
    });

    it('should leave an author-set aria-label and role in place', () => {
      canvas.setAttribute('aria-label', 'Author label');
      canvas.setAttribute('role', 'application');
      const chart = makeChart();
      chart2text.beforeInit?.(chart, {}, {});
      chart2text.afterUpdate?.(chart, { mode: 'default' as const }, {});

      destroy(chart);

      expect(canvas.getAttribute('aria-label')).toBe('Author label');
      expect(canvas.getAttribute('role')).toBe('application');
    });

    it('should not throw if the chart was never initialized and has no canvas', () => {
      expect(() => chart2text.afterDestroy?.({ canvas: null } as any, {}, {})).not.toThrow();
    });
  });
});
