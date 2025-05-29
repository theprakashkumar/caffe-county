import { useMutation } from "@tanstack/react-query";
import { storeCategories } from "apps/seller-ui/src/config/constant";
import axios from "axios";
import { useForm } from "react-hook-form";

interface FormState {
  name: string;
  bio: string;
  address: string;
  openingHours: string;
  website: string;
  category: string;
}

const CreateShop = ({
  sellerId,
  setActiveState,
}: {
  sellerId: string;
  setActiveState: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormState>({
    defaultValues: {
      name: "My Awesome Shop",
      bio: "Welcome to our store! We offer the best products at great prices.",
      address: "123 Main Street, Cityville, ST 12345",
      openingHours: "9:00 AM - 6:00 PM",
      website: "https://myawesomeshop.com",
      category: "",
    },
  });

  const shopCreationMutation = useMutation({
    mutationFn: async (data) => {
      console.log(data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setActiveState(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreationMutation.mutate(shopData);
  };

  const countWord = (text: string) => text.trim().split(/\+s/).length;

  return (
    <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4">
      <h1 className="text-center text-2xl font-bold">Create Store</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Name</label>
        <input
          type="text"
          className="rounded-md w-full p-2 my-2 bg-background"
          placeholder="Shop Name"
          {...register("name", {
            required: "Name is required!",
          })}
        />
        {errors.name && <p className="text-warning">{errors.name.message}</p>}
        <label>Bio</label>
        <input
          type="text"
          className="rounded-md w-full p-2 my-2 bg-background"
          placeholder="Bio"
          {...register("bio", {
            required: "Bio is required!",
            validate: (value) =>
              countWord(value) <= 100 || "Bio can't exceed 100 words",
          })}
        />
        {errors.bio && <p className="text-warning">{errors.bio.message}</p>}
        <label>Address</label>
        <input
          type="text"
          className="rounded-md w-full p-2 my-2 bg-background"
          placeholder="Address"
          {...register("address", {
            required: "Address is required!",
            validate: (value) =>
              countWord(value) <= 100 || " can't exceed 100 words",
          })}
        />
        {errors.address && (
          <p className="text-warning">{errors.address.message}</p>
        )}
        <label>Opening Hours</label>
        <input
          type="text"
          className="rounded-md w-full p-2 my-2 bg-background"
          placeholder="Opening Hours e.g. Mon - Fri 10AM - 5PM"
          {...register("openingHours", {
            required: "Opening hours is required!",
          })}
        />
        {errors.openingHours && (
          <p className="text-warning">{errors.openingHours.message}</p>
        )}
        <label>Website</label>
        <input
          type="text"
          className="rounded-md w-full p-2 my-2 bg-background"
          placeholder="Website"
          {...register("website", {
            pattern: {
              value:
                /^(https?:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/,
              message: "Enter a valid w ebsite URL",
            },
          })}
        />
        {errors.openingHours && (
          <p className="text-warning">{errors.openingHours.message}</p>
        )}
        <label>Category</label>
        <select
          className="rounded-md w-full p-2 my-2 bg-background"
          {...register("category", {
            required: "Country is required!",
          })}
          defaultValue=""
        >
          <option value="" disabled>
            Select country
          </option>
          {storeCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.openingHours && (
          <p className="text-warning">{errors.openingHours.message}</p>
        )}
        <button
          type="submit"
          className="bg-main text-background my-2 rounded-md w-full py-2"
        >
          {shopCreationMutation.isPending ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
