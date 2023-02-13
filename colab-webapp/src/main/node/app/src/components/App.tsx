/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useParams } from 'react-router-dom';
import { I18nCtx, Language, languages } from '../i18n/I18nContext';
import { useLocalStorage } from '../preferences';
import { store } from '../store/store';
import { init } from '../ws/websocket';
import { TipsConfig, TipsCtx } from './common/element/Tips';
import Loading from './common/layout/Loading';
import ErrorBoundary from './common/toplevel/ErrorBoundary';
import Notifier from './common/toplevel/Notifier';
import MainApp from './MainApp';
import { colabTheme, fonts, lightMode } from './styling/style';
import Token from './token/Token';
import { TocDisplayCtx, TocMode } from './resources/ResourcesList';

/**
 * To read parameters from hash
 */
function TokenWrapper() {
  const { id, token } = useParams<'id' | 'token'>();

  return <Token tokenId={id} token={token} />;
}

function App(): JSX.Element {
  const defaultLanguage =
    (navigator.languages
      .map(l => {
        // remove variant part and turn uppercase
        return (l.split('-')[0] || '').toUpperCase();
      })
      .find(lang => {
        return languages.includes(lang as Language);
      }) as Language) || 'EN';

  const [lang, setLang] = useLocalStorage<Language>('colab-language', defaultLanguage);
  const [tocMode, setTocMode] = useLocalStorage<TocMode>('colab-resource-toc-mode', 'CATEGORY');

  const [tipsConfig, setTipsConfig] = useLocalStorage<TipsConfig>('colab-tips-config', {
    TODO: false,
    NEWS: true,
    TIPS: true,
    WIP: false,
    DEBUG: false,
    FEATURE_PREVIEW: false,
  });

  const setTodoCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        TODO: v,
      })),
    [setTipsConfig],
  );

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

  const setWipCb = React.useCallback(
    (v: boolean) =>
      setTipsConfig(state => ({
        ...state,
        WIP: v,
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
      className={cx(colabTheme, lightMode, fonts)}
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
                      WIP: {
                        value: tipsConfig.WIP,
                        set: setWipCb,
                      },
                      TODO: {
                        value: tipsConfig.TODO,
                        set: setTodoCb,
                      },
                      FEATURE_PREVIEW: {
                        value: tipsConfig.FEATURE_PREVIEW,
                        set: setFeaturePreviewCb,
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
                        <Route path="*" element={<MainApp />} />
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
