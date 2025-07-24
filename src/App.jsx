import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import BookList from "./components/book/BookList";
import CardBook from "./components/book/CardBook";
import SearchResults from "./components/SearchResults";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/Book" element={<BookList />} />
        <Route path="/Book/:id" element={<CardBook />} />
        <Route path="/Sobre" element={<Sobre />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
