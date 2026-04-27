import { useState } from "react";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";

import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";

import DashboardPage from "./pages/DashboardPage";
import UsersPage     from "./pages/UsersPage";
import ProductsPage  from "./pages/ProductsPage";
import ChatPage      from "./pages/ChatPage";
import { CategoriesPage, OrdersPage, VouchersPage }     from "./pages/CatalogPages";
import { PaymentsPage, NotificationsPage } from "./pages/ServicePages";
import NewsAdminPage from "./pages/NewsAdminPage";


const PAGES = {
  dashboard:     DashboardPage,
  users:         UsersPage,
  products:      ProductsPage,
  categories:    CategoriesPage,
  orders:        OrdersPage,
  vouchers:      VouchersPage,
  chat:          ChatPage,

  payments:      PaymentsPage,
  notifications: NotificationsPage,
  news: NewsAdminPage,
};

export default function AdminDashboard() {
  const [page, setPage]       = useState("dashboard");
  const [animKey, setAnimKey] = useState(0);
  const PageComponent         = PAGES[page] ?? PAGES.dashboard;

  const handleNavigate = (id) => {
    setPage(id);
    setAnimKey((k) => k + 1);
  };

  return (
    <div className="admin-layout">
      <Sidebar activePage={page} onNavigate={handleNavigate} />
      <div className="main-area">
        <Topbar activePage={page} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="content-area">
          <div key={animKey} className="page-enter">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  );
}