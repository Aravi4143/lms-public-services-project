import { useRef, useState } from "react";
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
  const [descriptor, setDescriptor] = useState("");
  const [retake, setRetake] = useState(true);
  const [validating, setValidating] = useState(false);
  const registerButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevUser) => ({ ...prevUser, [e.target.name]: e.target.value }));
  };

  const retakeClicked=()=>{
    setImage(undefined)
    setRetake(false);
  }

  const handleCapture = async (
    imageFile: File,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (imageFile) {
      setImage(imageFile);
      await handleFaceIdentify(e, imageFile);
    } else {
      toast("Please retake the image", { type: "error" });
    }
    setRetake(true);
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
        imageDescriptor: descriptor
      };
      const response = await axiosInstance.post("/auth/register", { ...customUser });
      auth.login(response.data.token, response.data.user);
      toast("Successfully Registered!", { type: "success" });
      setImage(undefined);
      setUser({ username: "", name: "", password: "" });
      setDescriptor("");
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFaceIdentify = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, imageFile: File) => {
    e.preventDefault();
    if (!imageFile) {
      toast("Please upload an image to identify the face", { type: "error" });
      return;
    }
    setValidating(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axiosInstance.post("/face/identify", formData);
      if (response.data.success) {
        setDescriptor(response.data.faceDescriptor);
        toast(response.data.success, { type: "success" });
      } else {
        toast(response.data.error, { type: "error" });
      }
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

              <div className="form-control">
                <label className="label" htmlFor="image">
                  <span className="label-text">Choose an image:</span>
                </label>
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
              {retake&&<button className="btn btn-primary" onClick={retakeClicked}>retake</button>}

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
