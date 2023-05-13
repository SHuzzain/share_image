import React from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";

function ProdectLayout() {
  let params = useLocation().pathname.split("/").slice(-1)[0] === "create";
  const idParams = useParams(":id");
  if (idParams.id) {
    params = true;
  }
  const token = localStorage.getItem("accessToken");

  return (
    <>
      {!token ? null : (
        <article className="flex items-center p-4 text-white">
          <h2 className="flex-1 font-bold text-xl capitalize">
            {params
              ? `${idParams.id ? "image detail" : "create post"}`
              : "public community"}
          </h2>
          <button className="py-2 px-4 capitalize bg-yellow-500 font-medium text-sm rounded-md  ">
            <Link
              className="flex items-center"
              to={params ? ".." : "create"}
              relative="path"
            >
              {params ? "back" : "create"}
            </Link>
          </button>
        </article>
      )}
      <Outlet />
    </>
  );
}

export default ProdectLayout;
