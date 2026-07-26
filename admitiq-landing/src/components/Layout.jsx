import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <div className="aq-root">
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
