import loginJpg from "../assets/login-page-hero.jpg";
import logoSrc from "../assets/logo.png";
import { toast } from "react-toastify";

import CameraCapture from "./CameraCapture";
import { useRef, useState, useEffect } from "react";
import { Link, Navigate } from "@tanstack/react-location";
import axiosInstance from "../lib/http-client";
import useAuth from "../hooks/useAuth";

function Login() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [retake, setRetake] = useState(true);
  const auth = useAuth();
  const [capturedImage, setCapturedImage] = useState<File>();
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  // console.log(capturedImage)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevUser) => ({ ...prevUser, [e.target.name]: e.target.value }));
  };


  const retakeClicked=()=>{
    setCapturedImage(undefined)
  }

  const handleCapture = async (
    imageFile: File,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (imageFile) {
      setCapturedImage(imageFile);
    } else {
            // The face was not successfully identified
      toast("Please retake the image", { type: "error" });
      // startCamera();
    }
  };

  useEffect(() => {
    // Check if capturedImage is defined and the "Login" button ref exists
    if (capturedImage && loginButtonRef.current) {
      loginButtonRef.current.click();
    }
  }, [capturedImage]);

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!user.username) {
      toast("Please enter the username", { type: "error" });
      return;
    } 

    if (!user.password && !capturedImage) {
      toast("Please enter the password or capture an image", { type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", user.username);
      if (user.password) {
        formData.append("password", user.password);
      }
      if (capturedImage) {
        formData.append("image", capturedImage);
      }

      const response = await axiosInstance.post("/auth/login", formData);
      auth.login(response.data.token, response.data.user);
      toast("Successfully logged In!", { type: "success" });

      setUser({ username: "", password: "" });
      setCapturedImage(undefined);
    } catch (error: any) {
      const errorMessage =
      (error.response && error.response.data.message) || "An error occurred";
      toast(errorMessage, { type: "error" });
      setCapturedImage(undefined)   
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (auth.token) return <Navigate to="/" />;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row-reverse">
        <div className="w-full lg:max-w-[50%]">
          <img
            src={loginJpg}
            alt="Person working"
            className="w-full lg:min-h-[100vh]"
          />
        </div>
        <div className="w-full p-4">
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
              <label className="label">
                <span className="label-text">OR</span>
              </label>
              {capturedImage ? (
                <div className="uploaded-image">
                  <img
                    src={URL.createObjectURL(capturedImage)}
                    alt="Captured"
                    className="mt-4 max-h-64 blur-0 blur-sm filter"
                  />
                </div>
              ) : (
                <CameraCapture
                  onCapture={async (imageFile, e) => {
                    await handleCapture(imageFile, e); // Wait for handleCapture to finish
                    // handleLogin(e); // Call handleLogin after handleCapture
                  }}
                />
              )}
            </div>
            {retake&&<button className="btn btn-primary" onClick={retakeClicked}>retake</button>}
            <div className="form-control mt-6">
                            <button
                ref={loginButtonRef}
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
