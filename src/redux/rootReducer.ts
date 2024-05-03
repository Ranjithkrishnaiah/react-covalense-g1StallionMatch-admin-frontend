import { combineReducers } from 'redux';
// import reportSliceReducer from './actionReducers/reportSlice';
// import userSliceReducer from './actionReducers/userSlice';
import storage from 'redux-persist/lib/storage';
import { splitApi } from './rootMiddleware';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};


const rootReducer = combineReducers({
  [splitApi.reducerPath]: splitApi.reducer,
  // reportSlices: reportSliceReducer,
  // userSlices: userSliceReducer,
});

export { rootPersistConfig, rootReducer };
