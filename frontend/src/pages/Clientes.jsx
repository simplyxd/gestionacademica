import Header from "../components/Header"
import Footer from "../components/Footer"
import ClientesCard from "../components/ClientesCard"
import {clientes} from "../data/clientes"
function Clientes(){
  return(
    <div className="sga-page flex min-h-dvh flex-col">
      <Header/>
      <main className="container mx-auto flex-1 px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">
            CLIENTES
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
           {clientes.map((cliente) => (
            <ClientesCard
              key={cliente.id}
              nombre={cliente.nombre}
              rut={cliente.rut}
              dir={cliente.dir}
              />
           ))} 
        </div>
      </main>
      <Footer/>
    </div>
  )
}

export default Clientes