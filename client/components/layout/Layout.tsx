import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
    </div>
  );
}
