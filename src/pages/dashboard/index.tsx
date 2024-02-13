import { useState, useEffect, useContext } from "react";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref  } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";

import { FiTrash } from 'react-icons/fi';
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelheader";

interface CarsProps {
  id: string;
  name: string;
  year: string;
  price: string | number;
  city: string;
  uid: string;
  km: string;
  images: ImageCarProps[];
}

interface ImageCarProps {
  name: string;
  uid: string;
  url: string;
}

function Dashboard() {

  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState<CarsProps[]>([]);

  useEffect(() => {
    function LoadCars(){
      if(!user?.uid){
        return;
      }

      const carsRef = collection(db, 'cars');
      const queryRef = query(carsRef, where('uid', "==", user.uid))

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
    LoadCars()
  }, [])

  async function handleDeletCar(car: CarsProps){
    const itemCar = car;

    const docRef = doc(db, 'cars', itemCar.id)
    await deleteDoc(docRef);

    itemCar.images.map( async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath);
      try{
        await deleteObject(imageRef)
        setCars(cars.filter(car => car.id !== itemCar.id))
      }catch(err){
        console.log(err)
      }
    })

  }

    return (
      <>
        <Container>
          <DashboardHeader/>
          <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <section className="w-full bg-white rounded-lg relative" key={car.id}>
                <button 
                  onClick={() => handleDeletCar(car)}
                  className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
                >
                  <FiTrash size={26} color="#000"/>
                </button>
                <img 
                  src={car.images[0].url} 
                  alt="" 
                  className="w-full rounded-lg mb-2 max-h-70"
                />
                <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>
                <div className="flex flex-col px-2">
                  <span className="text-zinc-700">
                    Ano {car.year} | Km {car.km}
                  </span>
                  <strong className="font-bold text-black mt-4">
                    R$ {car.price}
                  </strong>
                </div>
                <div className="w-full h-px bg-slate-200 my-2"></div>
                <div className="px-2 pb-2">
                  <span className="text-black">
                    {car.city}
                  </span>
                </div>
              </section>
            ))}
          </main>
        </Container>
      </>
    )
  }
  
  export {Dashboard};