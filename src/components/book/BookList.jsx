import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BookList() {
  // Removed unused books prop
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]); // Added state for books

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://openlibrary.org/search.json?q=subject:science&sort=editions&limit=20"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();

        const formattedBooks = data.docs
          .filter((book) => book.cover_i)
          .slice(0, 20)
          .map((book) => ({
            id: book.key.replace("/works/", ""),
            titulo: book.title,
            autor: book.author_name?.[0] || "Autor desconhecido",
            anoPublicacao: book.first_publish_year || "Ano desconhecido",
            capa: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
            avalicao: "4",
            paginas: book.number_of_pages_median || "N/A",
          }));

        setBooks(formattedBooks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  function handleClick(id) {
    navigate(`/Book/${id}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 justify-center items-center">
      {books.map((livro) => (
        <motion.div
          key={livro.id}
          className="relative group cursor-pointer"
          onClick={() => handleClick(livro.id)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="h-72 w-48 object-cover group-hover:brightness-50 rounded-lg transition-all duration-300"
            src={livro.capa}
            alt={livro.titulo}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/150x200?text=No+Cover";
            }}
          />
          <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 opacity-0 group-hover:opacity-70 group-hover:bg-opacity-70 transition-all duration-300 text-white items-center justify-center flex flex-col p-2">
            <p className="font-bold text-center">{livro.titulo}</p>
            <p className="text-center">{livro.autor}</p>
            <p className="text-center">Publicação: {livro.anoPublicacao}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
