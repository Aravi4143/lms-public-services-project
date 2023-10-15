import React, { useEffect, useState } from "react";
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
import CameraCapture from "../components/CameraCapture";

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
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [isImageValid, setImageValid] = useState(false);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    auth.logout();
  };

  const handleUpdateFaceClick = () => {
    setShowProfileDropdown(false);
    setIsPopupOpen(true);
  };

  useEffect(() => {
    if (uploadedImage) {
      handleUpdateButtonClick();
    }
  }, [uploadedImage]);

  const handleUpdateButtonClick = async () => {
    if (!uploadedImage) {
      toast("Please upload an image to update the face", { type: "error" });
      return;
    }
    if (!auth.user) {
      toast("Please refresh the page and try again", { type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('username', auth.user.username);

    try {
      const response = await axiosInstance.post("/face/update", formData);
      toast("Successfully Updated!", { type: "success" });
      console.log(response.data);
      handlePopupClose();
    } catch (error: any) {
      const errorMessage =
      error.response.data.message || "An unkonown error occurred";
      toast(errorMessage, { type: "error" });
    } finally {
      setUploadedImage(undefined);
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setUploadedImage(undefined);
    setImageValid(false);
  };

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

  const handleCapture = async (
    imageFile: File,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (imageFile) {
      setUploadedImage(imageFile);
    } else {
      toast("Please retake the image", { type: "error" });
    }
  };

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
        <div className="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-80">
          <div className="relative mx-auto w-96 rounded-lg bg-white p-4">
            <button
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500"
              onClick={handlePopupClose}
            >
              &#10005;
            </button>
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
              {uploadedImage ? (
                <div className="uploaded-image">
                  <img
                    src={URL.createObjectURL(uploadedImage)}
                    alt="Uploaded"
                    className="blur-2 mt-4 max-h-64 blur-sm filter"
                  />
                </div>
              ) : (
                <CameraCapture
                  onCapture={async (imageFile: any, e: any) => {
                    await handleCapture(imageFile, e);
                  }}
                />
              )}
              {isImageValid && <span>&#10003;</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
