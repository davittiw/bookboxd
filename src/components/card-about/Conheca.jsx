import React from 'react'
import { Github, Linkedin } from 'lucide-react';

const creators = [
  {
    id: 1,
    img: "https://avatars.githubusercontent.com/u/115652855?v=4",
    description: "Creator and Full-Stack Developer",
    user: "Luccas Davi | @davittiw",
    socials: [
      { type: "github", url: "https://github.com/davittiw" },
      { type: "linkedin", url: "https://www.linkedin.com/in/davttiw/" }
    ] 
  }]


const Conheca = () => {
  return (
    <>
      <h1 className="w-full text-center text-3xl font-bold text-transparent bg-clip-text animate-gradient bg-gradient-to-r from-green-gradient-1 via-green-gradient-2 to-green-gradient-3">Meet the Creator</h1>
      {creators.map((creator) => (
        <div
          key={creator.id}
          className="relative p-1 full rounded-xl bg-gradient-to-r from-green-gradient-1 via-green-gradient-2 to-green-gradient-3 animate-gradient"
        >
          <div className="w-full p-5 flex flex-col gap-2 items-center bg-jet rounded-xl">

            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                <img
                  src={creator.img}
                  alt={creator.user}
                  className="object-cover w-full h-full"
                />
            </div>

            <h2 className="text-xl font-semibold text-white text-center">
              {creator.user}
            </h2>

            <p className="text-gray-400 text-center text-sm">{creator.description}</p>

            <div className="flex gap-4">
              {creator.socials.map(
                (social, index) =>
                  social.url && (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-400 transition-colors"
                      aria-label={social.type}
                    >
                      {social.type === "github" && (
                        <Github color="white" strokeWidth={1.5} size={24} />
                      )}
                      {social.type === "linkedin" && (
                        <Linkedin color="white" strokeWidth={1.5} size={24} />
                      )}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Conheca;
