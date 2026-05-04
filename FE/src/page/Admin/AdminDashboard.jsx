import { useState } from "react";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/AdminDashboard.css";
import BannersPage from "./pages/BannersPage";
import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";
import DashboardPage    from "./pages/DashboardPage";
import UsersPage        from "./pages/UsersPage";
import ProductsPage     from "./pages/ProductsPage";
import ChatPage         from "./pages/ChatPage";
import { CategoriesPage, OrdersPage, VouchersPage } from "./pages/CatalogPages";
import { PaymentsPage, NotificationsPage }          from "./pages/ServicePages";
import NewsAdminPage    from "./pages/NewsAdminPage";

const PAGES = {
  dashboard:     DashboardPage,
  users:         UsersPage,
  products:      ProductsPage,
  categories:    CategoriesPage,
  orders:        OrdersPage,
  vouchers:      VouchersPage,
  chat:          ChatPage,
  payments:      PaymentsPage,
  news:          NewsAdminPage,
  notifications: NotificationsPage,
  banners: BannersPage,
};

export default function AdminDashboard() {
  const [page, setPage]           = useState("dashboard");
  const [animKey, setAnimKey]     = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount]   = useState(0);

  const PageComponent = PAGES[page] ?? PAGES.dashboard;

  const handleNavigate = (id) => {
    setPage(id);
    setAnimKey((k) => k + 1);
    setSidebarOpen(false);
    if (id === "notifications") setNotifCount(0);
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        activePage={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        notifCount={notifCount}
      />
      <div className="main-area">
        <Topbar
          activePage={page}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onUnreadChange={setNotifCount}
          onNavigate={handleNavigate}
        />
        <main className="content-area">
          <div key={animKey} className="page-enter">
            <PageComponent onNavigate={handleNavigate} />
          </div>
        </main>
      </div>
    </div>
  );
}