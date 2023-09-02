import React, { useState, useEffect } from "react";
import logoSrc from "../assets/logo.png";
import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-location";
import TopBarLoader from "../components/TopBarLoader";
import { FaExternalLinkAlt } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";
import axiosInstance from "../lib/http-client";

type MainLayoutProps = {
  children: React.ReactNode;
};

function MainLayout(props: MainLayoutProps) {
  const router = useRouter();
  const location = useLocation();
  const auth = useAuth();
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const [isImageValid, setImageValid] = useState(false);
  const [descriptor, setDescriptor] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  const handleUpdateFaceClick = () => {
    setShowProfileDropdown(false); // Close dropdown when selecting "Update Face"
    setIsPopupOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);

      try {
        setIsUpdating(true);
        setUploadedImage(URL.createObjectURL(e.target.files[0]));

        const response = await axiosInstance.post("/face/identify", formData);
        if (response.data.success) {
          setDescriptor(response.data.faceDescriptor);
          setImageValid(true);
          setIsUpdating(false);
        } else {
          toast(response.data.error, { type: "error" });
          setIsUpdating(false);
        }
        console.log(response.data.success);
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
        setIsUpdating(false);
      }
    }
  };

  const handleUpdateButtonClick = async () => {
    if (!uploadedImage) {
      toast("Please upload an image to update the face", { type: "error" });
      return;
    }

    const customUser: any = {
      username: auth.user ? auth.user.username : null,
      image: uploadedImage,
      imageDescriptor: descriptor,
    };

    const response = await axiosInstance.post("/face/update", { ...customUser });
    toast("Successfully Updated!", { type: "success" });
    console.log(response.data);
    setDescriptor("");
    handlePopupClose();
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setUploadedImage("");
    setImageValid(false);
  };

  useEffect(() => {
    if (isUpdating) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          pending: "Validating...",
          success: "Validation Successful",
          error: "Validation Failed",
        }
      );
    }
  }, [isUpdating]);

  if (
    location.current.pathname.includes("login") ||
    location.current.pathname.includes("signup")
  ) {
    return <>{props.children}</>;
  }

  if (!auth.token) {
    navigate({
      to: "/login",
    });
  }

  return (
    <div>
      {router.pending ? <TopBarLoader /> : null}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 drop-shadow-lg">
        <div>
          <Link to={"/"}>
            <img src={logoSrc} alt="Digital Lync Logo" />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {location.current.pathname.includes("/admin") ? null : (
            <div>
              <Link
                // target={"_blank"}
                to={"admin"}
                className="link-primary  text-blue-500"
              >
                <span className="flex items-center">
                  Admin Portal <FaExternalLinkAlt className="pl-1" />
                </span>
              </Link>
            </div>
          )}

          {auth.user && (
            <div className="relative">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {auth.user.name.charAt(0)}
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-36 rounded bg-white shadow-md">
                  <ul className="py-1">
                    <li className="px-4 py-2">
                      <button
                        className="w-full text-left"
                        onClick={handleUpdateFaceClick}
                      >
                        Update Face
                      </button>
                    </li>
                    <li className="px-4 py-2">
                      <button
                        className="w-full text-left"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="min-h-screen">{props.children}</div>

      {isPopupOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-200 bg-opacity-80 flex justify-center items-center">
          <div className="relative mx-auto w-96 rounded-lg bg-white p-4">
            <button
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500"
              onClick={handlePopupClose}
            >
              &#10005;
            </button>
            {uploadedImage && (
              <img
                src="/face/fetch"
                alt="Customer's Existing Image"
                className="h-auto w-full rounded-md mb-4 filter blur-sm blur-2"
              />
            )}
            <input
              type="file"
              id="uploadImage"
              name="uploadImage"
              className="input input-bordered rounded-none mb-4"
              onChange={handleImageUpload}
            />
            <div className="mt-4 flex items-center space-x-2">
              {uploadedImage && (
                <div className="uploaded-image">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="mt-4 max-h-64 filter blur-sm blur-2"
                  />
                </div>
              )}
              {isImageValid && <span>&#10003;</span>}
            </div>
            <button
              className="btn btn-primary btn-sm mt-4"
              onClick={handleUpdateButtonClick}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
