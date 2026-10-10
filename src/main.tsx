import {createRoot} from 'react-dom/client';
import '@fontsource/dejavu-sans/400.css';
import '@fontsource/dejavu-sans/700.css';
import '@fontsource/dejavu-sans/400-italic.css';
import 'katex/dist/katex.min.css';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
