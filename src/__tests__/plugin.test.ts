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
        },
        isDatasetVisible: jest.fn(() => true)
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
