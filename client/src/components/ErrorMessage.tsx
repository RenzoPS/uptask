export default function ErrorMessage({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <div className=" text-center text-red-600 bg-red-100 font-bold p-3 uppercase text-sm">
         {children}
      </div>
   );
}
