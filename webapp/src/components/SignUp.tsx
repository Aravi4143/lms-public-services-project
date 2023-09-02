import { FormEvent, useState } from "react";
import loginJpg from "../assets/login-page-hero.jpg";
import logoSrc from "../assets/logo.png";
import { Link } from "@tanstack/react-location";
import axiosInstance from "../lib/http-client";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";

function SignUp() {
  const auth = useAuth();
  const [user, setUser] = useState({ username: "", name: "", password: "" });
  const [image, setImage] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(false);
  const [imageInput, setImageInput] = useState<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevUser) => ({ ...prevUser, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setValidationResult(false); // Reset validation result when image changes
    }
    setImageInput(e.target);
  };

  const handleRegister = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const customUser: any = {
        name: user.name,
        username: user.username,
        password: user.password,
        image: image,
        imageDescriptor: descriptor
      };
      const response = await axiosInstance.post("/auth/register", { ...customUser });
      auth.login(response.data.token, response.data.user);
      toast("Successfully Registered!", { type: "success" });
      console.log(response.data);
      setUser({ username: "", name: "", password: "" });
      setDescriptor("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleFaceIdentify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      toast("Please upload an image to identify the face", { type: "error" });
      return;
    }
    setValidating(true);
    const formData = new FormData();
    if (imageInput && imageInput.files) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      const response = await axiosInstance.post("/face/identify", formData);
      if (response.data.success) {
        setDescriptor(response.data.faceDescriptor);
        setValidationResult(true);
        toast(response.data.success, { type: "success" });
      } else {
        setValidationResult(false); 
        toast(response.data.error, { type: "error" });
      }
      console.log(response.data);
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          toast("Bad Request", { type: "warning" });
        } else {
          toast("Unexpected Error", { type: "error" });
        }
      } else {
        toast("Unexpected Error", { type: "error" });
      }
      console.log(error);
      setValidationResult(false);
    }
    setValidating(false);
  };

  return (
    <div className="min-h-screen ">
      <div className="flex flex-col lg:flex-row-reverse">
        <div className="w-full lg:max-w-[50%]">
          <img
            src={loginJpg}
            alt="Person working"
            className="w-full lg:min-h-[100vh]"
          />
        </div>
        <div className=" w-full p-4">
          <img src={logoSrc} alt="website logo" />
          <div className="card-body m-auto mt-28 max-w-lg">
            <p className="text-2xl">
              Welcome to <br />
              <span className="text-3xl font-bold">
                India’s #1 Training Institute
              </span>
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                name="username"
                type="text"
                placeholder="username"
                className="input input-bordered rounded-none"
                value={user.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="name"
                className="input input-bordered rounded-none"
                value={user.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="password"
                className="input input-bordered rounded-none"
                value={user.password}
                onChange={handleChange}
              />
            </div>

            <form
              method="POST"
              encType="multipart/form-data"
              onSubmit={handleFaceIdentify}
              className="flex flex-col items-center mt-4"
            >
              <div className="form-control w-full">
                <label className="label" htmlFor="image">
                  <span className="label-text">Choose an image:</span>
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  placeholder="JPG | JPEG FILES ONLY"
                  className="input input-bordered rounded-none"
                  onChange={handleImageChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary "
                disabled={!image || validating || (validationResult && !imageInput?.files)}
              >
                {validating
                  ? "Validating..."
                  : validationResult
                  ? "Validated"
                  : "Validate"}
              </button>
              {image && (
                <>
                  {validationResult ? (
                    <span className="text-green-500 ml-2">✅</span>
                  ) : (
                    <span className="text-red-500 ml-2">↻</span>
                  )}
                  <img
                    src={image}
                    alt="uploaded image"
                    className="mt-4 max-h-64 filter blur-sm blur-2"
                  />
                </>
              )}
            </form>

            <div className="form-control mt-6">
              <button
                onClick={handleRegister}
                className="btn btn-primary "
                disabled={validating}
              >
                Register
              </button>
            </div>

            <p className="mt-6 text-center">
              Already have an account ?{" "}
              <span className=" font-semibold underline">
                <Link to="/login">Login</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
