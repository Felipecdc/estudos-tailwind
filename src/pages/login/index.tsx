import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";

import logoImg from '../../assets/logo.svg'
import toast from 'react-hot-toast';

import { Container } from '../../components/container';
import { Input } from '../../components/input';

const schema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "O campo senha deve ter no minimo 6 caracteres"),
})

type FormData = z.infer<typeof schema>

function Login() {

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  useEffect(() => {
    async function handleLogOur() {
      await signOut(auth)
    }

    handleLogOur()
  }, [])

  async function onSubmit(data: FormData){
    signInWithEmailAndPassword(auth, data.email, data.password)
    .then((user) => {
      toast.success("Logado com sucesso!")
      console.log(user)
      navigate("/dashboard", {replace: true})
    })
    .catch((err) => {
      toast.error("Ops, tente novamente!")
      console.log(err)
    })
  }

    return (
      <>
        <Container>
          <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
            <Link to={"/"} className='mb-6 max-w-sm w-full'>
              <img 
                className='w-full'
                src={logoImg} 
                alt="Logo do site" 
              />
            </Link>
            <form 
              className='bg-white max-w-xl w-full rounded-lg p-4'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className='mb-3'>
                <Input
                  type="email"
                  placeholder="Digite seu email..."
                  name="email"
                  error={errors.email?.message}
                  register={register}
                />
              </div>
              <div className='mb-3'>
                <Input
                  type="password"
                  placeholder="Digite sua senha..."
                  name="password"
                  error={errors.password?.message}
                  register={register}
                />
              </div>
              <button type='submit' className='bg-zinc-900 rounded-lg w-full text-white font h-10 font-medium'>
                Acessar
              </button>
            </form>
            <Link to={'/register'}>
              Não possui uma conta? Cadastre-se
            </Link>
          </div>
        </Container>
      </>
    )
  }
  
  export {Login};