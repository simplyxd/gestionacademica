export default function CursosCard({
    nombre,
    desc,
    horas,
    icon}) 
{
  return(
  <>
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
    <div className="text-6xl text-center">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-center mt-4">
      {nombre}
    </h2>
    <p className="text-gray-600 text-center mt-2">
      {desc}
    </p>
    <div className="mt-4 text-center">
      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
       {horas} horas
      </span>
    </div>
   </div>
  </>
  )
} 