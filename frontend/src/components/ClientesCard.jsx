export default function CursosCard({
    nombre,
    rut,
    dir}) 
{
  return(
  <>
   <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 p-6">
    
    <h2 className="text-2xl font-bold text-center mt-4">
      {nombre}
    </h2>
    <p className="text-gray-600 text-center mt-2">
      {rut}
    </p>
    <div className="mt-4 text-center">
      <span className="rounded-full bg-[var(--sga-primary-soft)] px-3 py-1 text-sm text-[var(--sga-primary)]">
       {dir} 
      </span>
    </div>
   </div>
  </>
  )
} 