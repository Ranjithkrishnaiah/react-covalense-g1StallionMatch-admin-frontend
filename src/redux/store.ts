import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { rootPersistConfig, rootReducer } from './rootReducer';
import { splitApi } from './rootMiddleware';

export function setupStore() {
  const store = configureStore({
    reducer: persistReducer(rootPersistConfig, rootReducer),
    middleware: (gDM) => gDM({
      serializableCheck: false,
    }).concat(splitApi.middleware),
  });

  setupListeners(store.dispatch);

  return store;
}
const store = setupStore();

const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

// const { dispatch } = store;

// const useDispatch = () => useAppDispatch<AppDispatch>();

// const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;

export { store, persistor };
