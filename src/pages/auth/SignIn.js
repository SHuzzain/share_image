import { updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth, db, signIn, signUp } from "../../firebase";
import Loading from "react-loading";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { tokenCheck } from "../../feature/userSlice";

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "signIn";
  const [loading, setLoading] = useState(false);

  const searPathMode = {
    pathMode: !isLogin
      ? {
        name: "Sign Up",
        message: "Already have account?",
      }
      : {
        name: "Sign In",
        message: "i don't have account?",
      },
  };

  const [formInput, setFormeInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  // handle the user login or signUp
  const handleSumbit = async (e) => {
    e.preventDefault();
    setLoading(true);
    switch (isLogin) {
      case true:
        // login handle
        if (!formInput.email || !formInput.password) {

          alert("please fill the empty field");
        } else {
          try {
            //  backend
            await signIn(formInput.email, formInput.password)
              .then(() => {
                setFormeInput(() => ({
                  username: "",
                  email: "",
                  password: "",
                }));
                localStorage.setItem(
                  "accessToken",
                  auth.currentUser.refreshToken
                );
                dispatch(
                  tokenCheck({
                    accessToken: auth.currentUser.refreshToken,
                  })
                );
                const expiryTime = new Date();
                expiryTime.setHours(expiryTime.getHours() + 24);
                localStorage.setItem("expiration", expiryTime.toISOString());
              })
              .then(() => {
                navigate("..");
              });
          } catch (error) {
            const result = await error.message.split(" ").slice(-1);

            if (result[0].includes("password")) {
              setFormeInput((preVal) => ({
                ...preVal,
                password: "",
              }));
              alert("wrong passowrd please check the password");
            } else {
              alert(result[0]);
            }
          } finally {
            setLoading(false);
          }
        }
        break;
      case false:
        //  signUp
        if (!formInput.email || !formInput.username || !formInput.password) {
          alert("please fill the empty field");
        } else {
          // backend call
          await signUp(formInput.email, formInput.password)
            .then(async () => {
              await updateProfile(auth.currentUser, {
                displayName: formInput.username,
              });
              await setDoc(doc(db, "user", auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                displayName: formInput.username,
                email: formInput.email,
                photoUrl: "",
                online: true,
                bookmark: [],
                timestamp: serverTimestamp(),
              });
            })
            .then(() => {
              localStorage.setItem(
                "accessToken",
                auth.currentUser.refreshToken
              );
              dispatch(
                tokenCheck({
                  accessToken: auth.currentUser.refreshToken,
                })
              );
              const expiryTime = new Date();
              expiryTime.setHours(expiryTime.getHours() + 24);
              localStorage.setItem("expiration", expiryTime.toISOString());

              setFormeInput(() => ({
                email: "",
                username: "",
                password: "",
              }));
              navigate("..");
            })
            .finally(() => {
              setLoading(false);
            });
        }

        break;
      default:
        break;
    }
  };
  //  update current word in user type in input field
  const handleInputChange = (e) => {
    const currentFieldName = e.target.name;
    setFormeInput((preVal) => ({
      ...preVal,
      [currentFieldName]: e.target.value,
    }));
  };

  return (
    <div className="h-screen  bg-white px-2 py-1">
      <div className="min-w-[auto] max-w-[25rem] mx-auto  items-center  flex flex-col justify-center">
        <section className="flex flex-col gap-3 w-full">
          <h2 className="my-2 font-semibold text-base">Shareme</h2>
          <h2 className="font-bold text-3xl">{searPathMode.pathMode.name}</h2>
          <p className="text-gray-500 text-xs font-medium mb-3 text-center">
            {isLogin
              ? "Welcome back "
              : "See your growth and get consulting support!"}
          </p>
        </section>

        <section className="flex gap-1 items-center border rounded-full border-black p-3 w-full justify-center hover:bg-blue-500 transition-all duration-200 cursor-pointer hover:text-white text-base font-semibold active:scale-[0.98] hover:shadow-black active:shadow-sm">
          <img
            className="w-[25px]"
            src="https://companieslogo.com/img/orig/GOOG-0ed88f7c.png?t=1633218227"
            alt=""
          />
          <p>Sign up with Google</p>
        </section>

        <section className="max-h-[20rem] min-h-[auto] my-4 font-medium text-[12px] gap-1 text-gray-500 flex items-center w-full">
          <p className="w-full h-[0.7px] bg-gray-500" />{" "}
          <span className="whitespace-nowrap">
            {" "}
            or {searPathMode.pathMode.name} with Email
          </span>
          <p className="w-full h-[0.7px] bg-gray-500" />
        </section>

        <form
          onSubmit={handleSumbit}
          className="w-full flex [&>label>p]:text-sm [&>label>section>p]:text-sm  flex-col gap-3 [&>label>input]:loginForm font-medium"
        >
          {!isLogin && (
            <label htmlFor="name" className="sign_user">
              <p>Name*</p>
              <input
                required
                onChange={(e) => handleInputChange(e)}
                value={formInput.username}
                type="text"
                name="username"
                id="name"
              />
            </label>
          )}

          <label htmlFor="email">
            <p>Email*</p>
            <input
              required
              onChange={(e) => handleInputChange(e)}
              value={formInput.email}
              type="email"
              name="email"
              id="email"
            />
          </label>

          <label htmlFor="password">
            <p>Password*</p>
            <input
              required
              onChange={(e) => handleInputChange(e)}
              value={formInput.password}
              minLength="6"
              type="password"
              name="password"
              id="password"
            />
          </label>

          {!isLogin && (
            <label htmlFor="terms">
              <section className="flex gap-2 ">
                <input
                  className="w-3 cursor-pointer"
                  type="checkbox"
                  name=""
                  id="terms"
                />
                <p>
                  I agreee to the{" "}
                  <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                    Terms & Conditions
                  </span>
                </p>
              </section>
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full outline-none bg-blue-600 p-3 rounded-full mt-2 text-white hover:bg-blue-500 active:bg-blue-400 hover:shadow-md disabled:cursor-not-allowed  shadow-black flex justify-center"
          >
            {loading ? (
              <Loading
                type="spokes"
                color="white"
                width={30}
                height={30}
                className=""
              />
            ) : (
              searPathMode.pathMode.name
            )}
          </button>
        </form>
        <section className="w-full text-start mt-3 ">
          <p className="[&>a]:text-blue-500 [&>a]:font-medium text-sm">
            {searPathMode.pathMode.message}
            <Link to={`?mode=${isLogin ? "signUp" : "signIn"}`}>
              {!isLogin ? " SignIn" : " SignUp"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default SignIn;
