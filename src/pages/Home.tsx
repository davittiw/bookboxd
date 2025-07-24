import Navbar from '../components/header/Navbar';
import Inicio from '../components/Inicio';
import BookList from '../components/Book/BookList';
import Footer from '../components/footer/Footer';

import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      <Navbar />

      <motion.main
        className='main-content-home w-full min-h-screen p-10 flex flex-col items-center justify-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <div className="max-w-6xl flex flex-col items-center gap-0 md:gap-10 justify-center">
          <Inicio />
          <BookList/>
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
