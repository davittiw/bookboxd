import { Search } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({
  onSearchResults,
}: {
  onSearchResults: (books: []) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError("Por favor, digite um termo de busca");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          searchTerm
        )}&limit=200`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar livros");
      }

      const data = await response.json();

      if (data.docs.length === 0) {
        setError("Nenhum livro encontrado");
        return;
      }

      const booksWithCovers = data.docs
        .filter((book: any) => book.cover_i)
        .map((book: any) => ({
          id: book.key.replace("/works/", ""),
          titulo: book.title,
          autor: book.author_name?.join(", ") || "Autor desconhecido",
          sinopse: book.first_sentence?.[0] || "Sinopse não disponível",
          anoPublicacao: book.first_publish_year || "Ano desconhecido",
          capa: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
          avalicao: "4",
          paginas: book.number_of_pages_median?.toString() || "N/A",
        }));

      if (booksWithCovers.length === 0) {
        setError("Livros encontrados, mas sem capas disponíveis");
        return;
      }

      onSearchResults?.(booksWithCovers);
      navigate("/search", { state: { searchResults: booksWithCovers } });
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="search-form bg-gray-300 rounded-lg w-full h-12 items-center px-5 py-1 flex">
      <form
        onSubmit={handleSubmit}
        className="search-form flex flex-row justify-between w-full"
      >
        <input
          type="text"
          className="w-full bg-transparent text-black outline-none"
          placeholder="Pesquisar por título ou autor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError(null);
          }}
        />
        <button type="submit" aria-label="Buscar" disabled={isLoading}>
          {isLoading ? (
            <span className="animate-spin">↻</span>
          ) : (
            <Search color="#A735F2" />
          )}
        </button>
      </form>

      {error && (
        <div className="absolute mt-12 bg-red-100 text-red-800 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
