import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0B1E3D] px-6 py-12 text-[#94a3b8]">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/logoSeazone.svg"
            alt="Seazone"
            width={80}
            height={20}
            className="brightness-0 invert"
          />
          <span className="border-l border-white/15 pl-3 text-sm text-[#8a7d70]">
            Guia do Hóspede
          </span>
        </div>
        <p className="text-sm">
          Desafio técnico · AI Builder · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
