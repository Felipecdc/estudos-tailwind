
import { ChangeEvent, useState, useContext } from "react";
import { FiUpload, FiTrash } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from 'zod';
import { v4 as uuidV4 } from 'uuid';
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../context/AuthContext";
import toast from "react-hot-toast";

import { storage, db } from "../../../services/firebase";
import { uploadBytes, getDownloadURL, deleteObject, ref } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';

import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";

const schema = z.object({
  name: z.string().min(3, "Escreva o nome completo do carro"),
  model: z.string().min(1, "O modelo é obrigatório"),
  year: z.string().min(1, "O ano é obrigatório"),
  km: z.string().min(1, "O Km do carro é obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  whatsapp: z.string().min(1, "O telefone com DDD é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Numero de telefone inválido",
  }),
  description: z.string().min(1, "A descrição é obrigatória")
})

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  Url: string;
}

type FormData = z.infer<typeof schema>;

function New() {

  const { user } = useContext(AuthContext);
  const [carImages, setCarImages] = useState<ImageItemProps[]>([])

  const {register, handleSubmit, formState: {errors}, reset} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  function onSubmit(data: FormData){
    if(carImages.length === 0){
      toast.error("Envie pelo menos 1 imagem");
      
    }
    const carListImages = carImages.map((car) => {
      return{
        uid: car.uid,
        name: car.name,
        url: car.Url
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name,
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
    .then(() => {
      reset();
      setCarImages([]);
      console.log("Cadastrado com sucesso!")
    })
    .catch((err) => { console.log(err) })

    console.log(data)
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]
      if(image.type === "image/jpeg" || image.type === "image/png"){
        await handleUpload(image)
      }else{
        alert("Envie uma imagem jpeg ou png!")
        return;
      }
    }
  }

  async function handleUpload(image: File){
    if(!user?.uid){
      return;
    }

    const currentuid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentuid}/${uidImage}`)
  
    uploadBytes(uploadRef, image)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        console.log(downloadUrl)
        const imageItem = {
          name: uidImage,
          uid: currentuid,
          previewUrl: URL.createObjectURL(image),
          Url: downloadUrl,
        }
        setCarImages((images) => [...images, imageItem])
      })
    })
    .catch((err) => { console.log(err) })
  }

  async function handleDeletImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.Url !== item.Url))
    }catch(err){
      console.log(err);
    }
  }

    return (
      <>
        <Container>
          <DashboardHeader/>
          <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
            <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
              <div className="absolute cursor-pointer">
                <FiUpload size={30} color="#000"/>
              </div>
              <div className="cursor-pointer">
                <input 
                  type="file" 
                  accept="image/" 
                  className="opacity-0 cursor-pointer" 
                  onChange={handleFile}
                />
              </div>
            </button>
            {carImages.map((item) => (
              <div key={item.name} className="w-full h-32 items-center flex justify-center relative">
                <button className="absolute" onClick={() => handleDeletImage(item)}>
                  <FiTrash size={28} color="#fff"/>
                </button>
                <img
                  className="rounded-lg w-full h-32 object-cover" 
                  src={item.previewUrl} 
                  alt="Foto do carro" 
                />
              </div>
            ))}
          </div>
          <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
            <form action=""
              className="w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="mb-3">
                <p className="mb-2 font-medium">Nome do carro</p>
                <Input
                  type="text"
                  register={register}
                  name="name"
                  error={errors.name?.message}
                  placeholder="Ex: Onix 1.0..."
                />
              </div>
              <div className="mb-3">
                <p className="mb-2 font-medium">Modelo do carro</p>
                <Input
                  type="text"
                  register={register}
                  name="model"
                  error={errors.model?.message}
                  placeholder="Ex: 1.0 flex manual"
                />
              </div>
              <div className="flex flex-row w-full mb-3 items-center gap-4">
                <div className="mb-3 w-full">
                  <p className="mb-2 font-medium">Ano do carro</p>
                  <Input
                    type="text"
                    register={register}
                    name="year"
                    error={errors.year?.message}
                    placeholder="Ex: 2016/2016"
                  />
                </div>
                <div className="mb-3 w-full">
                  <p className="mb-2 font-medium">Km do carro</p>
                  <Input
                    type="text"
                    register={register}
                    name="km"
                    error={errors.km?.message}
                    placeholder="Ex: 28.900..."
                  />
                </div>
              </div>
              <div className="flex flex-row w-full mb-3 items-center gap-4">
                <div className="mb-3 w-full">
                  <p className="mb-2 font-medium">Telefone para contato</p>
                  <Input
                    type="text"
                    register={register}
                    name="whatsapp"
                    error={errors.whatsapp?.message}
                    placeholder="Ex: 011 991057868"
                  />
                </div>
                <div className="mb-3 w-full">
                  <p className="mb-2 font-medium">Cidade</p>
                  <Input
                    type="text"
                    register={register}
                    name="city"
                    error={errors.city?.message}
                    placeholder="Ex: Hortolândia-SP"
                  />
                </div>
              </div>
              <div className="mb-3">
                <p className="mb-2 font-medium">Preço</p>
                <Input
                  type="text"
                  register={register}
                  name="price"
                  error={errors.price?.message}
                  placeholder="Ex: 67.900"
                />
              </div>
              <div className="mb-3">
                <p className="mb-2 font-medium">Descrição</p>
                <textarea
                  className="b-2 w-full rounded-md h-20 px-2"
                  {...register("description")}
                  name="description"
                  id="description"
                  placeholder="Digite a descrição completa sobre o carro..."
                />
                {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
              </div>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 text-white font-medium w-full h-10"
              > 
                Cadastrar 
              </button>
            </form>
          </div>
        </Container>
      </>
    )
  }
  
  export {New};