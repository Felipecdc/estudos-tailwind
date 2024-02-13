import { RegisterOptions, UseFormRegister } from 'react-hook-form';

interface InputProps {
    placeholder: string;
    type: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions
}

export function Input({ name, type, placeholder, register, error, rules }: InputProps){
    return(
        <div>
            <input 
                className="w-full border-2 rounded-md h-11 px-2 focus:outline-none"
                placeholder={placeholder}
                type={type}
                {...register(name, rules)}
                id={name}
            />
            {error && <p className='my-1 text-red-500'>{error}</p>}
        </div>
    )
}