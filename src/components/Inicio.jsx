import SearchBar from './SearchBar'
import IconBookboxd from './IconBookboxd';

export default function Inicio () {
    return (
        <div className="flex flex-col h-96 w-96 items-center justify-center gap-4">
            <IconBookboxd/>

            <p className="text-center text-white">Encontre seu próximo livro favorito em segundos.
            No BookBoxd, você pesquisa obras com facilidade e vê todos os detalhes técnicos que importam! Descubra, explore e se conecte com o mundo dos livros!</p>
            <SearchBar />
        </div>
    )
}