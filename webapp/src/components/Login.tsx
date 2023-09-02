import loginJpg from "../assets/login-page-hero.jpg";
import logoSrc from "../assets/logo.png";
import { toast } from "react-toastify";

import { useState } from "react";
import { Link, Navigate } from "@tanstack/react-location";
import axiosInstance from "../lib/http-client";
import useAuth from "../hooks/useAuth";

function Login() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [image, setImage] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevUser) => ({ ...prevUser, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!user.password && !image) {
      toast("Please enter the password or upload an image", { type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", user.username);
      if (user.password) {
        formData.append("password", user.password);
      }
      if (image) {
        formData.append("image", image);
      }

      const response = await axiosInstance.post("/auth/login", formData);
      auth.login(response.data.token, response.data.user);
      toast("Successfully logged In!", { type: "success" });

      setUser({ username: "", password: "" });
      setImage(undefined);
    } catch (error: any) {
      const errorMessage =
        (error.response && error.response.data.message) || "An error occurred";
      toast(errorMessage, { type: "error" });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (auth.token) return <Navigate to="/" />;

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
                India&apos;s #1 Training Institute
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

            <div className="form-control">
              <label className="label" htmlFor="image">
                <span className="label-text">Upload an image</span>
              </label>
              <input
                type="file"
                id="image"
                name="image"
                className="input input-bordered rounded-none"
                onChange={handleImageChange}
              />
              {image && (
                <div className="uploaded-image">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    className="mt-4 max-h-64 filter blur-sm blur-2"
                  />
                </div>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                className="btn btn-primary"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
            <p className="mt-6 text-center">
              Don&apos;t have an account?{" "}
              <span className="font-semibold underline">
                <Link to="/signup">Register</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
