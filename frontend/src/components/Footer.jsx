export default function Footer(){
  return(
  <>
    <footer className="sga-footer mt-12 border-t-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7">
        <div>
          <p className="font-bold text-white">Universidad Andrés Bello</p>
          <p className="mt-1 text-sm text-gray-300">Portal de gestión académica</p>
        </div>
        <div className="text-sm sm:text-right">
          <a href="https://www.unab.cl/" target="_blank" rel="noreferrer" className="font-semibold text-white underline decoration-[#6480c4] underline-offset-4 hover:text-gray-200">
            Sitio institucional
          </a>
          <p className="mt-2 text-gray-400">© 2026 Universidad Andrés Bello</p>
        </div>
      </div>
    </footer>
  </>
  )
}