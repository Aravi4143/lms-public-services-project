import { useEffect, useRef, useState } from "react";
import loginJpg from "../assets/login-page-hero.jpg";
import logoSrc from "../assets/logo.png";
import { Link } from "@tanstack/react-location";
import axiosInstance from "../lib/http-client";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";
import CameraCapture from "./CameraCapture";

function SignUp() {
  const auth = useAuth();
  const [user, setUser] = useState({ username: "", name: "", password: "" });
  const [image, setImage] = useState<File>();
  const [validating, setValidating] = useState(false);
  const registerButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevUser) => ({ ...prevUser, [e.target.name]: e.target.value }));
  };

  const handleCapture = async (
    imageFile: File,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (imageFile) {
      setImage(imageFile);
    } else {
      toast("Please retake the image", { type: "error" });
    }
  };

  useEffect(() => {
    if (image && registerButtonRef.current) {
      registerButtonRef.current.click();
    }
  }, [image]);

  const handleRegister = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!user.username || !user.password || !user.name) {
      toast("Mandatory fields are username,name and password", {
        type: "error",
      });
      return;
    }
    if (!image) {
      toast("Capture your face for faster logins", { type: "info" });
    }
    setValidating(true);

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("username", user.username);
      formData.append("password", user.password);

      if (image) {
        formData.append("image", image);
      }

      const response = await axiosInstance.post("/auth/register", formData);
      auth.login(response.data.token, response.data.user);
      toast("Successfully Registered!", { type: "success" });
      setUser({ username: "", name: "", password: "" });
    } catch (error: any) {
      const errorMessage =
        error.response.data.message || "An unknown error occurred";
      toast(errorMessage, { type: "error" });
      setImage(undefined);
    } finally {
      setValidating(false);
    }
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

            <div
              className="form-control"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
              }}
            >
              {image ? (
                <div className="uploaded-image">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Captured"
                    className="mt-4 max-h-64 blur-0 blur-sm filter"
                  />
                </div>
              ) : (
                <CameraCapture
                  onCapture={async (imageFile: any, e: any) => {
                    await handleCapture(imageFile, e);
                  }}
                />
              )}
            </div>

            <div className="form-control mt-6">
              <button
                onClick={handleRegister}
                className="btn btn-primary "
                disabled={validating}
                ref={registerButtonRef}
              >
                {validating ? "Onboarding..." : "Register"}
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
