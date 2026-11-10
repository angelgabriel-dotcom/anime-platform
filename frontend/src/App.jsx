import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home        from "./pages/Home";
import Battle      from "./pages/Battle";
import Leaderboard from "./pages/Leaderboard";

function PageNavigation() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageNavigation />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/battle"      element={<Battle />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}
