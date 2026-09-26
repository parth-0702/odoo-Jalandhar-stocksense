import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from './api/client';
import { signedIn, signedOut } from './store';
import { Loading } from './components/ui';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DocumentListPage from './pages/DocumentListPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import SettingsPage from './pages/SettingsPage';
import LedgerPage from './pages/LedgerPage';
import ProfilePage from './pages/ProfilePage';
import CatalogViewsPage from './pages/CatalogViewsPage';
function Protected() { const { user, checked } = useSelector(s => s.auth); return !checked ? <Loading/> : user ? <Layout/> : <Navigate to="/login" replace/>; }
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => { if (!sessionStorage.getItem('stocksense-token')) dispatch(signedOut()); else api.get('/auth/me').then(r => dispatch(signedIn(r.data))).catch(() => { sessionStorage.removeItem('stocksense-token'); dispatch(signedOut()); }); }, [dispatch]);
  return <Routes><Route path="/login" element={<AuthPage key="login" mode="login"/>}/><Route path="/signup" element={<AuthPage key="signup" mode="signup"/>}/><Route path="/forgot-password" element={<AuthPage key="forgot" mode="forgot"/>}/><Route element={<Protected/>}><Route index element={<DashboardPage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="products/new" element={<ProductDetailPage/>}/><Route path="products/:id" element={<ProductDetailPage/>}/>{['receipts', 'deliveries', 'transfers', 'adjustments'].map(module => <Route key={module}><Route path={module} element={<DocumentListPage key={module} module={module}/>}/><Route path={`${module}/new`} element={<DocumentDetailPage key={`${module}-new`} module={module}/>}/><Route path={`${module}/:id`} element={<DocumentDetailPage key={module} module={module}/>}/></Route>)}<Route path="categories" element={<CatalogViewsPage/>}/><Route path="reordering" element={<CatalogViewsPage rules/>}/><Route path="reports" element={<DashboardPage reports/>}/><Route path="ledger" element={<LedgerPage/>}/>{['warehouses', 'locations'].map(module => <Route key={module} path={module} element={<SettingsPage key={module} module={module}/>}/>)}<Route path="profile" element={<ProfilePage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>;
}
