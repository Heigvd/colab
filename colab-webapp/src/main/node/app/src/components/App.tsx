/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx, injectGlobal } from '@emotion/css';
import * as React from 'react';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { I18nCtx, Language, languages } from '../i18n/I18nContext';
import { useLocalStorage } from '../preferences';
import { store } from '../store/store';
import { fonts, heading, lightMode, text } from '../styling/theme';
import { init } from '../ws/websocket';
import { TipsConfig, TipsCtx } from './common/element/Tips';
import Flex from './common/layout/Flex';
import Loading from './common/layout/Loading';
import ErrorBoundary from './common/toplevel/ErrorBoundary';
import Notifier from './common/toplevel/Notifier';
import MainApp from './MainApp';
import { TocDisplayCtx, TocMode } from './resources/ResourcesList';
import { TokenWrapper } from './token/TokenRouting';

injectGlobal`
    html {
        box-sizing: border-box;
        font-size: ${text.sm};
        line-height: ${text.lineHeight};
        font-weight: ${text.regular};
        color: var(--text-primary);
        margin: 0;
        padding: 0;
    }

    * {
      font-family: 'Public Sans', 'serif';
    }

    a, button, a:hover, button:hover {
        text-decoration: none;
    }

    h1, h2, h3, h4, h5, h6 {
        font-weight: ${heading.weight};
        line-height: ${heading.lineHeight};
        margin: 0;
        padding: 0;
    }

    h1 {
        font-size: ${heading.lg};
    }

    h2 {
        font-size: ${heading.md};
    }

    h3 {
        font-size: ${heading.sm};
    }

    h4 {
        font-size: ${heading.xs};
    }

    button {
      background-color: transparent;
      border: 1px solid transparent;
    }
`;

function App(): JSX.Element {
  const defaultLanguage =
    // try to know it from navigator
    (navigator.languages
      .map(l => {
        // remove variant part and turn uppercase
        return (l.split('-')[0] || '').toUpperCase();
      })
      .find(lang => {
        return languages.includes(lang as Language);
      }) as Language) ||
    // else english
    'EN';

  const [lang, setLang] = useLocalStorage<Language>('colab-language', defaultLanguage);

  const [tocMode, setTocMode] = useLocalStorage<TocMode>('colab-resource-toc-mode', 'CATEGORY');

  const [tipsConfig, setTipsConfig] = useLocalStorage<TipsConfig>('colab-tips-config', {
    TIPS: true,
    NEWS: true,
    FEATURE_PREVIEW: false,
    WIP: false,
    TODO: false,
    DEBUG: false,
  });

  const setTipsCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        TIPS: v,
      })),
    [setTipsConfig],
  );

  const setNewsCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        NEWS: v,
      })),
    [setTipsConfig],
  );

  const setFeaturePreviewCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        FEATURE_PREVIEW: v,
      })),
    [setTipsConfig],
  );

  const setWipCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        WIP: v,
      })),
    [setTipsConfig],
  );

  const setTodoCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        TODO: v,
      })),
    [setTipsConfig],
  );

  const setDebugCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        DEBUG: v,
      })),
    [setTipsConfig],
  );

  /**
   * prevent application quit on file drop
   */
  const cancelDroppingFiles = React.useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.items.length > 0) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      className={cx(lightMode, fonts, css({ display: 'flex', flexDirection: 'column' }))}
      onDrop={cancelDroppingFiles}
      onDragOver={cancelDroppingFiles}
    >
      <React.StrictMode>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Provider store={store}>
              <TocDisplayCtx.Provider value={{ mode: tocMode, setMode: setTocMode }}>
                <I18nCtx.Provider value={{ lang: lang, setLang: setLang }}>
                  <TipsCtx.Provider
                    value={{
                      TIPS: {
                        value: tipsConfig.TIPS,
                        set: setTipsCb,
                      },
                      NEWS: {
                        value: tipsConfig.NEWS,
                        set: setNewsCb,
                      },
                      FEATURE_PREVIEW: {
                        value: tipsConfig.FEATURE_PREVIEW,
                        set: setFeaturePreviewCb,
                      },
                      WIP: {
                        value: tipsConfig.WIP,
                        set: setWipCb,
                      },
                      TODO: {
                        value: tipsConfig.TODO,
                        set: setTodoCb,
                      },
                      DEBUG: {
                        value: tipsConfig.DEBUG,
                        set: setDebugCb,
                      },
                    }}
                  >
                    <Notifier />
                    <HashRouter>
                      <Routes>
                        <Route path="/token/:id/:token" element={<TokenWrapper />} />
                        <Route path="/token/*" element={<TokenWrapper />} />
                        <Route
                          path="*"
                          element={
                            <Flex
                              direction="column"
                              align="stretch"
                              className={css({ minHeight: '100vh' })}
                            >
                              <MainApp />
                            </Flex>
                          }
                        />
                      </Routes>
                    </HashRouter>
                  </TipsCtx.Provider>
                </I18nCtx.Provider>
              </TocDisplayCtx.Provider>
            </Provider>
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    </div>
  );
}

function mount() {
  const container = document.getElementById('root');
  const root = createRoot(container!);
  return root.render(<App />);
}

init();
mount();
