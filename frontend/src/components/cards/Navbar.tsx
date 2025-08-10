"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Dancing_Script } from "next/font/google";
import SearchBar from "./search-bar";
import { useState, useEffect } from "react";
import { NavbarProps,UserProfile } from "@/interfaces/nav";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
});



export default function Navbar({
  showSignup = true,
  showCreateEvent = false,
  showLogin = false,
  onSearch,
  onLogout,
}: NavbarProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dashboardOpen, setDashboardOpen] = useState<boolean>(false);
  const [internalLoggedIn, setInternalLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  useEffect(() => {
    let ignore = false;

    const fetchUserProfile = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser) {
          try {
            const userObj: UserProfile = JSON.parse(storedUser);
            setInternalLoggedIn(true);

            const userId =
              userObj.userId || userObj.id || userObj.UserId || userObj.Id;

            if (userId && token) {
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Users/${userId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (res.ok) {
                  const data: UserProfile = await res.json();
                  setUsername(data.name || data.username || "User");
                  setEmail(data.email || "user@gmail.com");

                  let img = data.profileImage || data.imageUrl || "";
                  if (img.startsWith("/uploads/")) {
                    img = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}${img}`;
                  }

                  if (!ignore) setProfileImageUrl(img);
                }
              } catch {
                // Fetch failure fallback
              }
            }
          } catch {
            // fallback: treat stored string as username
            setUsername(storedUser);
            setInternalLoggedIn(true);
          }
        } else {
          setUsername("");
          setEmail("");
          setInternalLoggedIn(false);
          setProfileImageUrl("");
        }

        setLoading(false);
      }
    };

    fetchUserProfile();

    const handleProfileImageUpdated = () => {
      fetchUserProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("profileImageUpdated", handleProfileImageUpdated);

      const body = document.body;
      if (dashboardOpen) {
        body.classList.add("overflow-hidden");
      } else {
        body.classList.remove("overflow-hidden");
      }

      return () => {
        ignore = true;
        body.classList.remove("overflow-hidden");
        window.removeEventListener("profileImageUpdated", handleProfileImageUpdated);
      };
    }
  }, [dashboardOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      setMenuOpen(false);
      setDashboardOpen(false);
      setInternalLoggedIn(false);
      setUsername("");
      if (onLogout) onLogout();
      router.push("/");
    }
  };

  const isHome = pathname === "/";
  const isLogin = pathname?.toLowerCase() === "/login";
  const isSignup = pathname?.toLowerCase() === "/signup";
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/event");

  if (loading) return null;

  const NAVBAR_HEIGHT = 80;
  const HR_HEIGHT = 1;
  const TOTAL_NAV_HEIGHT = NAVBAR_HEIGHT + HR_HEIGHT;

  return (
    <>
      <style>{`
        main, .main-content {
          margin-top: ${TOTAL_NAV_HEIGHT}px !important;
        }
      `}</style>
      <nav className="fixed top-0 left-0 w-full z-50">
        <div className="flex flex-col gap-2 bg-white bg-opacity-50 px-4 sm:px-8 pt-2 pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 w-full relative">

            <button
              type="button"
              className={`text-3xl sm:text-4xl font-bold ${dancingScript.className} focus:outline-none`}
              style={{
                color: "#c20078ff",
                letterSpacing: "2px",
                fontWeight: 700,
                textShadow: "0 2px 8px #fff6, 0 1px 0 #fff",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => {
                if (internalLoggedIn) {
                  router.push("/dashboard");
                } else {
                  router.push("/");
                }
              }}
            >
              EventSphere
            </button>

            {onSearch && (
              <div className="w-full sm:w-auto my-2 sm:my-0 flex justify-center sm:justify-start">
                <SearchBar onSearch={onSearch} />
              </div>
            )}

            <button
              className="sm:hidden absolute right-0 top-2 p-2 focus:outline-none"
              aria-label="Open menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="block w-6 h-0.5 bg-black mb-1"></span>
              <span className="block w-6 h-0.5 bg-black mb-1"></span>
              <span className="block w-6 h-0.5 bg-black"></span>
            </button>

            {/* Main Nav */}
            <ul
              className={`flex gap-2 sm:gap-4 text-black items-center flex-col sm:flex-row w-full sm:w-auto mt-2 sm:mt-0
              ${menuOpen ? "flex" : "hidden"} sm:flex
              bg-white sm:bg-transparent rounded-lg sm:rounded-none shadow sm:shadow-none p-4 sm:p-0 absolute sm:static top-12 right-0 z-50 sm:z-auto`}
            >
              {(!isHome) && (isLogin || isSignup) && (
                <li className="w-full sm:w-auto">
                  <Link
                    href="/"
                    className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
              )}

              {isHome && (
                <>
                  <li className="w-full sm:w-auto">
                    <Link
                      href="/Login"
                      className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li className="w-full sm:w-auto">
                    <Link
                      href="/Signup"
                      className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}

              {isLogin && (
                <li className="w-full sm:w-auto">
                  <Link
                    href="/Signup"
                    className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
              )}

              {isSignup && (
                <li className="w-full sm:w-auto">
                  <Link
                    href="/Login"
                    className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>

            {/* Profile Icon */}
            {isDashboard && (
              <div className="flex items-center ml-0 sm:ml-4 mt-3 sm:mt-0 relative w-full sm:w-auto justify-center">
                {showCreateEvent && (
                  <div className="w-full mr-2 sm:w-auto">
                    <Link
                      href="/event/create-event"
                      className="block text-center w-full px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      Create Event
                    </Link>
                  </div>
                )}
                <div className="relative group w-full sm:w-auto flex justify-center">
                  <button
                    className="flex items-center gap-2 w-full sm:w-auto px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold max-w-[180px] hover:bg-gray-300"
                    onClick={() => setDashboardOpen((open) => !open)}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-gray-600 text-lg font-bold overflow-hidden">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="Profile"
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <hr className="h-px my-0 bg-gray-200 border-0 dark:bg-gray-700" />

        {/* Dashboard Side Drawer */}
        {dashboardOpen && internalLoggedIn && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 backdrop-blur-sm bg-white/30 z-[100]"
              onClick={() => setDashboardOpen(false)}
            ></div>

            {/* Right-side Drawer */}
            <aside className="fixed top-0 right-0 w-80 max-w-full h-full bg-white shadow-lg p-6 flex flex-col gap-6 z-[101] animate-slideInRight">
              {/* User info block */}
              <div className="flex flex-col items-center gap-2 border-b pb-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl overflow-hidden">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{username}</p>
                  <p className="text-sm text-gray-600 break-all">
                    {email || "user@gmail.com"}
                      
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <nav className="flex flex-col gap-3 flex-1">
                <button
                  onClick={() => {
                    router.push("/dashboard/edit-profile");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/upcoming-organized-events");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Upcoming Organized Events
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/upcoming-registered-events");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Upcoming Registered Events
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/bookmarks");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Bookmarked Events
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/past-attended-events");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Past Attended Events
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/past-organized-events");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Past Organized Events
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/tickets");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Tickets Booked
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/settings");
                    setDashboardOpen(false);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                >
                  Settings
                </button>
              </nav>

              {/* Logout and Delete Account */}
              <div className="flex gap-2 mt-auto">
                <button
                  className="flex-1 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded bg-gray-300 text-black font-semibold hover:bg-gray-400 transition-colors duration-200"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                      const storedUser = localStorage.getItem("user");
                      const token = localStorage.getItem("token");
                      let userId = null;
                      if (storedUser) {
                        try {
                          const userObj = JSON.parse(storedUser);
                          userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
                        } catch {}
                      }
                      if (userId && token) {
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Users/${userId}`, {
                            method: "DELETE",
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) {
                            handleLogout();
                          } else {
                            alert("Failed to delete account. Please try again.");
                          }
                        } catch {
                          alert("Failed to delete account. Please try again.");
                        }
                      } else {
                        alert("User not found or not logged in.");
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </aside>
          </>
        )}
      </nav>
    </>
  );
}
