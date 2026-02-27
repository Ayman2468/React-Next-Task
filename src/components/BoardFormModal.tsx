import { useForm } from "react-hook-form";

type Props = {
  defaultValues?: { name: string; description?: string };
  onSubmit: (data: { name: string; description?: string }) => void;
  onClose: () => void;
};

export default function BoardFormModal({ defaultValues, onSubmit, onClose }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl w-80 space-y-4"
      >
        <h2 className="text-xl font-bold">{defaultValues ? "Edit Board" : "Add Board"}</h2>
        <input {...register("name")} placeholder="Board Name" className="w-full border p-2 rounded"/>
        <input {...register("description")} placeholder="Description" className="w-full border p-2 rounded"/>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{defaultValues ? "Update" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}