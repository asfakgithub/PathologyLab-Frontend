import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../../core/providers/ThemeProvider';
import { ThemeHandler } from '../../Component/common/ThemeHandler';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock theme service
jest.mock('../../services/themeService', () => ({
  ...jest.requireActual('../../services/themeService'),
  getAllThemes: jest.fn().mockResolvedValue({
    data: [
      {
        name: 'dark',
        colors: {
          primary: '#ff0000',
          background: '#ff0000',
          text: '#ff0000',
          accent: '#ff0000',
        },
      },
    ],
  }),
}));

const server = setupServer(
  rest.get('/api/themes', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            name: 'dark',
            colors: {
              primary: '#ff0000',
              background: '#ff0000',
              text: '#ff0000',
              accent: '#ff0000',
            },
          },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TestComponent = () => {
  const { theme } = useTheme();
  return <div data-testid="theme-consumer">{theme}</div>;
};

describe('Theme System', () => {
  it('should apply the theme from the API and not overwrite it', async () => {
    render(
      <ThemeProvider>
        <ThemeHandler />
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for the theme to be fetched and applied
    await waitFor(() => {
      const root = document.documentElement;
      // The background color should be the one from the API (#ff0000)
      expect(root.style.getPropertyValue('--background-color')).toBe('#ff0000');
    });

    // Check that the theme context also reflects the correct theme name
    expect(screen.getByTestId('theme-consumer')).toHaveTextContent('dark');
  });
});

