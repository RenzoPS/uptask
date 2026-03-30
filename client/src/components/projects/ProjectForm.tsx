import type { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import type { ProjectFormData } from "types";

type ProjectFormProps = {
   register: UseFormRegister<ProjectFormData>;
   errors: FieldErrors<ProjectFormData>;
};

export default function ProjectForm({ register, errors }: ProjectFormProps) {
   return (
      <>
         <div className="mb-5 space-y-3">
            <label htmlFor="name" className="text-sm uppercase font-bold">
               Nombre del Proyecto
            </label>
            <input
               id="name"
               className="w-full p-3  border border-gray-200"
               type="text"
               placeholder="Nombre del Proyecto"
               {...register("name", {
                  required: "El Titulo del Proyecto es obligatorio",
               })}
            />

            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
         </div>

         <div className="mb-5 space-y-3">
            <label htmlFor="clientName" className="text-sm uppercase font-bold">
               Nombre Cliente
            </label>
            <input
               id="clientName"
               className="w-full p-3  border border-gray-200"
               type="text"
               placeholder="Nombre del Cliente"
               {...register("clientName", {
                  required: "El Nombre del Cliente es obligatorio",
               })}
            />

            {errors.clientName && (
               <ErrorMessage>{errors.clientName.message}</ErrorMessage>
            )}
         </div>

         <div className="mb-5 space-y-3">
            <label
               htmlFor="description"
               className="text-sm uppercase font-bold"
            >
               Descripción
            </label>
            <textarea
               id="description"
               className="w-full p-3  border border-gray-200"
               placeholder="Descripción del Proyecto"
               {...register("description", {
                  required: "Una descripción del proyecto es obligatoria",
               })}
            />

            {errors.description && (
               <ErrorMessage>{errors.description.message}</ErrorMessage>
            )}
         </div>
      </>
   );
}
