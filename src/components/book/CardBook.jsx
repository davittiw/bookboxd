import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../header/Navbar";
import Footer from "../footer/Footer";
import HalfRating from "../HalfRating";
import { motion } from "framer-motion";
import {
  MoveLeft,
  BookOpenText,
  Star,
  Calendar,
  Bookmark,
  Languages,
  Info,
  Book,
  Globe,
  Hash,
  User,
  MapPin,
  Clock,
  Library,
} from "lucide-react";

export default function CardBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [workData, setWorkData] = useState(null);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);

        // 1. First fetch the work data
        const workRes = await fetch(`https://openlibrary.org/works/${id}.json`);
        if (!workRes.ok) throw new Error("Work not found");
        const workData = await workRes.json();
        setWorkData(workData);

        // 2. Fetch author details
        let authors = "Unknown author";
        if (workData.authors?.length) {
          const names = await Promise.all(
            workData.authors.map(async (a) => {
              try {
                const r = await fetch(
                  `https://openlibrary.org${a.author.key}.json`
                );
                const authorData = await r.json();
                return (
                  authorData.name ||
                  authorData.personal_name ||
                  "Unknown author"
                );
              } catch {
                return "Unknown author";
              }
            })
          );
          authors = names.join(", ");
        }

        // 3. Fetch editions data
        const editionsRes = await fetch(
          `https://openlibrary.org/works/${id}/editions.json`
        );
        const editionsData = await editionsRes.json();
        const editionsList = editionsData.entries || [];
        setEditions(editionsList);

        // 4. Try to find the "best" edition to display by default
        let defaultEdition = null;

        // Priority 1: Edition with cover
        defaultEdition = editionsList.find((e) => e.covers?.[0]) || null;

        // Priority 2: First edition with ISBN
        if (!defaultEdition) {
          defaultEdition =
            editionsList.find((e) => e.isbn_10?.[0] || e.isbn_13?.[0]) || null;
        }

        // Priority 3: First edition available
        if (!defaultEdition && editionsList.length > 0) {
          defaultEdition = editionsList[0];
        }

        setSelectedEdition(defaultEdition);

        // 5. If we found an edition, fetch its full details from the Books API
        let editionDetails = null;
        if (defaultEdition) {
          try {
            const editionKey = defaultEdition.key.replace("/books/", "");
            const editionRes = await fetch(
              `https://openlibrary.org/books/${editionKey}.json`
            );
            editionDetails = await editionRes.json();
          } catch (e) {
            console.log("Couldn't fetch edition details", e);
          }
        }

        // 6. Get cover (try work covers first, then edition covers)
        let coverId = workData.covers?.[0] || defaultEdition?.covers?.[0];
        let coverUrl = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : "https://via.placeholder.com/150x200?text=No+Cover";

        // 7. Prepare subjects (genres/categories)
        const subjects =
          workData.subjects?.join(", ") || "No subjects available";
        const subjectPeople = workData.subject_people?.join(", ") || "";
        const subjectPlaces = workData.subject_places?.join(", ") || "";
        const subjectTimes = workData.subject_times?.join(", ") || "";

        // 8. Prepare the book object combining work and edition data
        setBook({
          id,
          title: workData.title,
          author: authors,
          description:
            workData.description?.value ||
            workData.description ||
            "No description available",
          firstPublished:
            workData.first_publish_date ||
            workData.first_publish_year ||
            "Unknown",
          cover: coverUrl,
          pages:
            editionDetails?.number_of_pages ||
            defaultEdition?.number_of_pages ||
            workData.number_of_pages ||
            "N/A",
          rating: workData.ratings_average?.toFixed(1) || 4, // Use actual rating if available
          subjects,
          subjectPeople,
          subjectPlaces,
          subjectTimes,
          editionsCount: editionsData.size || 0,
          languages:
            workData.languages?.map((lang) =>
              lang.key.replace("/languages/", "")
            ) || [],
          publishers:
            defaultEdition?.publishers?.join(", ") ||
            editionDetails?.publishers?.join(", ") ||
            "Unknown",
          publishDate:
            defaultEdition?.publish_date ||
            editionDetails?.publish_date ||
            "Unknown",
          isbn:
            defaultEdition?.isbn_10?.[0] ||
            defaultEdition?.isbn_13?.[0] ||
            editionDetails?.isbn_10?.[0] ||
            editionDetails?.isbn_13?.[0] ||
            "N/A",
          physicalFormat:
            defaultEdition?.physical_format ||
            editionDetails?.physical_format ||
            "Unknown",
          workData, // Store the complete work data
          editionDetails, // Store the complete edition data
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

  const handleEditionChange = async (edition) => {
    try {
      // Fetch full edition details from Books API
      const editionKey = edition.key.replace("/books/", "");
      const editionRes = await fetch(
        `https://openlibrary.org/books/${editionKey}.json`
      );
      const editionDetails = await editionRes.json();

      setSelectedEdition(edition);

      // Update book data with the new edition's details
      setBook((prev) => ({
        ...prev,
        cover: edition.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${edition.covers[0]}-L.jpg`
          : prev.cover,
        pages:
          editionDetails?.number_of_pages ||
          edition.number_of_pages ||
          prev.pages,
        publishers:
          edition.publishers?.join(", ") ||
          editionDetails?.publishers?.join(", ") ||
          prev.publishers,
        publishDate:
          edition.publish_date ||
          editionDetails?.publish_date ||
          prev.publishDate,
        isbn:
          edition.isbn_10?.[0] ||
          edition.isbn_13?.[0] ||
          editionDetails?.isbn_10?.[0] ||
          editionDetails?.isbn_13?.[0] ||
          prev.isbn,
        physicalFormat:
          edition.physical_format ||
          editionDetails?.physical_format ||
          prev.physicalFormat,
        editionDetails,
      }));
    } catch (err) {
      console.error("Failed to fetch edition details:", err);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <main className="main-content bg-gradient-to-br from-jet via-zika to-green-gradient-2 animate-gradient w-full min-h-screen p-10 flex items-center justify-center">
          <div className="text-white">Loading book details...</div>
        </main>
        <Footer />
      </>
    );

  if (error || !book)
    return (
      <>
        <Navbar />
        <main className="main-content bg-gradient-to-br from-jet via-zika to-green-gradient-2 animate-gradient w-full min-h-screen p-10 flex items-center justify-center">
          <div className="text-white text-center">
            <p>{error || "Book not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <motion.main
        className="main-content bg-gradient-to-br flex-grow from-jet via-zika to-green-gradient-2 animate-gradient w-full min-h-screen p-10 flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <div className="card-main-content h-auto w-full max-w-[90vw] sm:max-w-[800px] lg:max-w-5xl backdrop-blur-sm bg-black/20 border border-white/20 rounded-xl flex flex-col md:flex-row justify-center gap-5 py-5 px-5 shadow-lg">
          <button
            onClick={() => navigate(-1)}
            className="absolute z-50 top-5 md:left-3 left-100 bg-red-900/20 p-1 rounded-full text-white hover:text-purple-400 transition-colors"
          >
            <MoveLeft size={24} />
          </button>

          {/* Left Column - Cover and Basic Info */}
          <div className="flex flex-col gap-5 w-full md:w-1/3">
            {/* Cover */}
            <div className="card-image w-full flex flex-col items-center gap-2">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full max-w-[250px] h-auto shadow-md rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/150x200?text=No+Cover";
                }}
              />
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400" size={18} />
                <span className="text-white font-medium">
                  {book.rating} {typeof book.rating === "number" && "/ 5"}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-black/20 p-4 rounded-lg">
              <h1 className="font-bold text-2xl text-white mb-2">
                {book.title}
              </h1>
              <h3 className="text-white font-semibold text-lg mb-4">
                {book.author}
              </h3>

              <div className="space-y-3 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> First published: {book.firstPublished}
                </p>
                <p className="flex items-center gap-2">
                  <BookOpenText size={16} /> Pages: {book.pages}
                </p>
                <p className="flex items-center gap-2">
                  <Library size={16} /> Format: {book.physicalFormat}
                </p>
                <p className="flex items-center gap-2">
                  <Bookmark size={16} /> Editions: {book.editionsCount}
                </p>
                {book.languages.length > 0 && (
                  <p className="flex items-center gap-2">
                    <Languages size={16} /> Languages:{" "}
                    {book.languages.join(", ")}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Hash size={16} /> ISBN: {book.isbn}
                </p>
                <p className="flex items-center gap-2">
                  <Book size={16} /> Publisher: {book.publishers}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> Published: {book.publishDate}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="flex flex-col gap-5 w-full md:w-2/3">
            {/* Description */}
            <div className="bg-black/20 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Info size={20} /> Description
              </h2>
              <p className="text-gray-300 whitespace-pre-line">
                {typeof book.description === "string"
                  ? book.description
                  : "No description available"}
              </p>
            </div>

            {/* Subjects */}
            {(book.subjects ||
              book.subjectPeople ||
              book.subjectPlaces ||
              book.subjectTimes) && (
              <div className="bg-black/20 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Subjects & Themes
                </h2>

                {book.subjects !== "No subjects available" && (
                  <>
                    <h3 className="text-md font-semibold text-white mt-3 mb-1 flex items-center gap-2">
                      <Bookmark size={16} /> Genres & Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {book.subjects.split(", ").map((subject, index) => (
                        <span
                          key={index}
                          className="bg-purple-900/50 px-3 py-1 rounded-full text-sm text-purple-200 hover:bg-purple-800 transition-colors cursor-pointer"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {book.subjectPeople && (
                  <>
                    <h3 className="text-md font-semibold text-white mt-3 mb-1 flex items-center gap-2">
                      <User size={16} /> People
                    </h3>
                    <p className="text-gray-300">{book.subjectPeople}</p>
                  </>
                )}

                {book.subjectPlaces && (
                  <>
                    <h3 className="text-md font-semibold text-white mt-3 mb-1 flex items-center gap-2">
                      <MapPin size={16} /> Places
                    </h3>
                    <p className="text-gray-300">{book.subjectPlaces}</p>
                  </>
                )}

                {book.subjectTimes && (
                  <>
                    <h3 className="text-md font-semibold text-white mt-3 mb-1 flex items-center gap-2">
                      <Clock size={16} /> Time Periods
                    </h3>
                    <p className="text-gray-300">{book.subjectTimes}</p>
                  </>
                )}
              </div>
            )}

            {/* Editions */}
            {editions.length > 0 && (
              <div className="bg-black/20 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Book size={20} /> Editions ({editions.length})
                </h2>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900/20">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Publisher
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          ISBN
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {editions.slice(0, 5).map((edition, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-purple-900/20 cursor-pointer ${
                            selectedEdition?.key === edition.key
                              ? "bg-purple-900/30"
                              : ""
                          }`}
                          onClick={() => handleEditionChange(edition)}
                        >
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {edition.title || book.title}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {edition.publishers?.[0] || "Unknown"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {edition.publish_date || "Unknown"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {edition.isbn_10?.[0] ||
                              edition.isbn_13?.[0] ||
                              "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {editions.length > 5 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Showing 5 of {editions.length} editions
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}
