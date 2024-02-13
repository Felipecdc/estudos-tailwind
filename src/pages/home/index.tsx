import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Link } from "react-router-dom";

import { Container } from "../../components/container";

interface CarsProps {
  id: string;
  name: string;
  year: string;
  km: string;
  uid: string;
  price: string | number;
  city: string;
  images: CarImagesProps[];
}

interface CarImagesProps {
  name: string;
  uid: string;
  url: string;
}

function Home() {

  const [cars, setCars] = useState<CarsProps[]>([])
  const [carsFiltered, setCarsFiltered] = useState<CarsProps[] | undefined>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState<string | undefined>()

  useEffect(() => {
    LoadCars()
  }, [])

  function LoadCars(){
    const carsRef = collection(db, 'cars');
    const queryRef = query(carsRef, orderBy('created', 'desc'))

    getDocs(queryRef)
    .then((snapshot) => {
      let listCars = [] as CarsProps[];

      snapshot.forEach( doc => {
        listCars.push({
          id: doc.id,
          name: doc.data().name,
          year: doc.data().year,
          km: doc.data().km,
          city: doc.data().city,
          price: doc.data().price,
          images: doc.data().images,
          uid: doc.data().uid
        })
      })
      setCars(listCars);
      console.log(listCars)
    })
  }

  function handleImageLoad(id: string){
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchCar(){
    if(!input){
      LoadCars();
      return;
    }

    const inputName = input.toUpperCase();
    const filterCarByInput = cars.filter((car) => {
      const upperCaseName = car.name.toUpperCase();
      /*economizar processamento salvando no banco como upper e apenas buscar o nome
      sem prefcisar transformar*/
      return upperCaseName.includes(inputName)
    })
    
    //filtragem dentro do firebase aqui........
    // {
    //   // setCars([]);
    //   // setLoadImages([]);
  
    //   // const q = query(collection(db, 'cars'), 
    //   // where('name', '>=', input.toUpperCase()),
    //   // where('name', '<=', input.toUpperCase() + "\uf8ff")
    //   // )
  
    //   // const querySnapshot = await getDocs(q)
    //   // let listCars = [] as CarsProps[];
  
    //   // querySnapshot.forEach((doc) => {
    //   //   listCars.push({
    //   //     id: doc.id,
    //   //     name: doc.data().name,
    //   //     year: doc.data().year,
    //   //     km: doc.data().km,
    //   //     city: doc.data().city,
    //   //     price: doc.data().price,
    //   //     images: doc.data().images,
    //   //     uid: doc.data().uid
    //   //   })
    //   // })
    // } 

    setCars(filterCarByInput)
    console.log(filterCarByInput)
  }

    return (
      <>
        <Container>
          <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
            <input
              className="w-full border-2 rounded-lg h-9 px-3 outline-none"
              type="text" 
              placeholder="Digite o nome do carro..." 
              value={input}
              onChange={ (e) => setInput(e.target.value)}
              />
            <button 
              className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
              onClick={handleSearchCar}
            >
              Buscar
            </button>
          </section>
          <h1 className="font-bold text-center mt-6 text-2xl mb-4">
            Carros novos e usados em todo o Brasil
          </h1>

          <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <Link to={`/car/${car.id}`}>
                <section className="w-full bg-white rounded-lg" key={car.id}>
                  <div 
                    className="w-full rounded-lg h-72 bg-slate-200"
                    style={{ display: loadImages.includes(car.id) ? 'none' : 'block' }}
                  ></div>
                  <img 
                    className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all object-cover"
                    src={car.images[0].url} 
                    alt="Carro" 
                    onLoad={() => handleImageLoad(car.id)}
                    style={{ display: loadImages.includes(car.id) ? 'block' : 'none' }}
                  />
                  <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
                  <div className="flex flex-col px-2">
                    <span className="text-zinc-700 mb-6">Ano {car.year} | Km {car.km}</span>
                    <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
                    <div className="w-full h-px bg-slate-300 my-2"></div>
                    <div className="px-2 pb-2">
                      <span className="text-zinc-700">
                        {car.city}
                      </span>
                    </div>
                  </div>
                </section>
              </Link>
            ))}
          </main>
        </Container>
      </>
    )
  }
  
  export {Home};
  