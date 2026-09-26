import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
export const loadCatalog = createAsyncThunk('catalog/load', async () => {
  const [products, warehouses, locations] = await Promise.all(['products', 'warehouses', 'locations'].map(path => api.get(`/${path}`, { background: true })));
  return { products: products.data, warehouses: warehouses.data, locations: locations.data };
});
const authSlice = createSlice({ name: 'auth', initialState: { user: null, checked: false }, reducers: {
  signedIn(state, { payload }) { state.user = payload; state.checked = true; },
  signedOut(state) { state.user = null; state.checked = true; },
} });
const catalogSlice = createSlice({ name: 'catalog', initialState: { products: [], warehouses: [], locations: [], error: null }, reducers: {}, extraReducers: builder => builder.addCase(loadCatalog.fulfilled, (state, { payload }) => { Object.assign(state, payload); state.error = null; }).addCase(loadCatalog.rejected, (state, action) => { state.error = action.error.message; }) });
export const { signedIn, signedOut } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer, catalog: catalogSlice.reducer } });
