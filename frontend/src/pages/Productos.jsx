import Header from "../components/Header"
import Footer from "../components/Footer"
import ProductosCard from "../components/ProductosCard"
import {productos} from "../data/productos"
function Productos(){
  return(
    <div className="sga-page flex min-h-dvh flex-col">
      <Header/>
      <main className="container mx-auto flex-1 px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">
            Productos Disponibles
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
           {productos.map((producto) => (
            <ProductosCard
              key={producto.id}
              nombre={producto.nombre}
              desc={producto.desc}
              cant={producto.cant}
              />
           ))} 
        </div>
      </main>
      <Footer/>
    </div>
  )
}

export default Productos