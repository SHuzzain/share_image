import { updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth, db, signIn, signUp } from "../../firebase";
import Loading from "react-loading";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { tokenCheck } from "../../feature/userSlice";
import { useForm, } from "react-hook-form";


function SignIn() {
  const navigate = useNavigate();
  const { getValues, setValue, handleSubmit, formState: { errors }, register, setError, reset, watch } = useForm({
    mode: 'onSubmit',
    shouldUseNativeValidation: true

  })

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



  // handle the user login or signUp
  const fromSumbit = async (e) => {
    setLoading(true);
    const formInput = getValues()
    switch (isLogin) {
      case true:
        try {
          //  backend
          await signIn(formInput.email, formInput.password)
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
            })
            .then(() => {
              navigate("..");
            });
        } catch (error) {
          const result = await error.message.split(" ").slice(-1);

          if (result[0].includes("password")) {
            setValue('password', '')
            setError("username", {
              type: "manual",
              message: "oops! your password is wrong take breath try again",
            })
          } else {
            alert(result[0]);
          }
        } finally {
          setLoading(false);
          reset()
        }

        break;
      case false:
        //  signUp
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
            navigate("..");
          })
          .finally(() => {
            reset()
            setLoading(false);
          });
        break;
      default:
        break;
    }
  };



  return (
    <div div className="h-screen flex items-center justify-center bg-white px-2 py-1 bg-gradient-to-c from-yellow-300 from-50% to-black to-50%" >
      <div className={`w-[28rem] border ${Object.keys(errors).length ? 'border-red-400' : 'border-white'} rounded p-3`}>

        <section className="flex flex-col gap-3 w-full">
          <h2 className="my-2 font-semibold text-base mix-blend-difference text-yellow-300">Shareme</h2>
          <h2 className="font-bold text-3xl mix-blend-difference text-yellow-300">{searPathMode.pathMode.name}</h2>
          <p className="text-gray-400 mix-blend-difference text-xs font-medium mb-3 text-center">
            {isLogin
              ? "Welcome back "
              : "See your growth and get consulting support!"}
          </p>
        </section>
        <section className="flex gap-1 mix-blend-difference items-center border rounded-full border-black p-3 w-full justify-center hover:border-yellow-300  transition-colors duration-300 cursor-pointer  text-base font-semibold active:scale-[0.98] hover:shadow-black active:shadow-sm">
          <img
            className="w-6"
            src="https://companieslogo.com/img/orig/GOOG-0ed88f7c.png?t=1633218227"
            alt=""
          />
          <p className="max-sm:text-sm mix-blend-difference text-yellow-300">Sign up with Google</p>
        </section>

        <section className="max-h-[20rem] min-h-[auto] my-4 font-medium text-[12px] gap-1 text-gray-400 flex items-center w-full">
          <p className="w-full h-[0.7px] bg-gray-500" />{" "}
          <span className="whitespace-nowrap mix-blend-difference">
            {" "}
            or {searPathMode.pathMode.name} with Email
          </span>
          <p className="w-full h-[0.7px] bg-gray-500" />
        </section>

        <form
          onSubmit={handleSubmit(fromSumbit)}
          className="w-full flex [&>label>p]:text-sm [&>label>section>p]:text-sm  flex-col gap-3 [&>label>input]:loginForm font-medium"
        >
          {!isLogin && (
            <label htmlFor="name" className="sign_user">
              <p className="mix-blend-difference text-yellow-300">Name*</p>
              <input
                {...register('username', {
                  required: 'This field required'
                })}
                type="text"
                id="name"
                className={` ${errors?.username ? 'outline-red-500' : "outline-blue-500"}`}
              />
            </label>
          )}

          <label htmlFor="email">
            <p className="mix-blend-difference text-yellow-300">Email*</p>
            <input {...register("email", {
              required: "Please Enter Your Email!",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please Enter A Valid Email!"
              }
            })} type="email" id="email"
              className={`${errors?.email ? 'outline-red-500' : "outline-blue-500"}`} />
          </label>

          <label htmlFor="password">
            <p className="mix-blend-difference text-yellow-300">Password*</p>
            <input

              {...register('password', {
                minLength: {
                  value: 6,
                  message: 'Password must be at least 8 characters long'
                },
                required: 'This field required'
              })}
              type="password"
              id="password"
              className={`${errors?.password ? 'outline-red-500' : "outline-blue-500"}`}
            />
          </label>

          {!isLogin && (
            <label htmlFor="terms">
              <section className="flex gap-2 ">
                <input
                  className="w-3 cursor-pointer accent-yellow-300"
                  type="checkbox"
                  name=""
                  id="terms"
                />
                <p className="mix-blend-difference text-yellow-300 ">
                  I agreee to the{" "}
                  <span className=" mix-blend-normal text-white  hover:text-blue-500 cursor-pointer">
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
          <p className="[&>a]:text-white text-yellow-300 mix-blend-difference [&>a]:font-medium text-sm">
            {searPathMode.pathMode.message}
            <Link to={`?mode=${isLogin ? "signUp" : "signIn"}`}>
              {!isLogin ? " SignIn" : " SignUp"}
            </Link>
          </p>
        </section>
      </div>

    </div >
  );
}

export default SignIn;
