import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "./header/Navbar";
import Footer from "./footer/Footer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Book {
  id: string;
  titulo: string;
  autor: string;
  anoPublicacao: string;
  capa: string;
  avalicao: string;
  paginas: string;
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const books: Book[] = location.state?.searchResults ?? [];
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    setImagesLoaded(Array(books.length).fill(false));
  }, [books]);

  const handleImageLoad = (i: number) =>
    setImagesLoaded((prev) => prev.map((l, idx) => (idx === i ? true : l)));

  if (!books.length)
    return (
      <>
        <Navbar />
        <main className="main-content-home bg-gradient-to-br from-jet via-zika to-green-gradient-2 animate-gradient w-full min-h-screen p-10 flex flex-col items-center pt-20">
          <h2 className="text-white text-3xl font-bold mb-6">
            Search Results (0)
          </h2>
          <p className="text-white">Nenhum resultado encontrado</p>
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <main className="main-content-home bg-gradient-to-br from-jet via-zika to-green-gradient-2 animate-gradient w-full min-h-screen p-10 flex flex-col items-center pt-20">
        <h2 className="text-white text-3xl font-bold mb-6">
          Search Results ({books.length})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 justify-center items-center">
          {books.map((livro, i) => (
            <motion.div
              key={livro.id}
              className="relative group cursor-pointer"
              onClick={() =>
                navigate(`/Book/${livro.id}`, { state: { book: livro } })
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: imagesLoaded[i] ? 1 : 0,
                y: imagesLoaded[i] ? 0 : 20,
              }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              {!imagesLoaded[i] && (
                <Skeleton
                  width={192} // w-48
                  height={288} // h-72
                  borderRadius={8}
                  baseColor="#2d1b3e"
                  highlightColor="#4c1e7e"
                />
              )}
              <img
                className={`h-72 w-48 object-cover rounded-lg transition-all duration-300
                            ${
                              imagesLoaded[i]
                                ? "opacity-100"
                                : "opacity-0 absolute inset-0"
                            }`}
                src={livro.capa}
                alt={livro.titulo}
                onLoad={() => handleImageLoad(i)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150x200?text=No+Cover";
                  handleImageLoad(i);
                }}
              />
              {imagesLoaded[i] && (
                <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 opacity-0 group-hover:opacity-70 group-hover:bg-opacity-70 transition-all duration-300 text-white items-center justify-center flex flex-col p-2">
                  <p className="font-bold text-center">{livro.titulo}</p>
                  <p className="text-center">{livro.autor}</p>
                  <p className="text-center">
                    Publicação: {livro.anoPublicacao}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
