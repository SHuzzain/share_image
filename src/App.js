import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import HomePages, { Loading as homeLoading } from "./pages/HomePages";
import Prodectpage, { loading as prodectLoading } from "./pages/Prodectpage";
import HelpPage from "./pages/HelpPage";
import RootLayout from "./root/RootLayout";
import AuthPage from "./pages/auth/AuthPage";
import ProdectLayout from "./root/ProdectLayout";
import CreatePost from "./components/CreatePost";
import ProdectDetail from "./pages/ProdectDetail";
import ProfilePage from "./pages/ProfilePage";
import { checkUserToken } from "./pages/auth/authInfoSet";

function App() {
  const route = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,

      children: [
        {
          index: true,
          element: <HomePages />,
          loader: () => checkUserToken("onlyCheck"),
        },
        {
          path: "product",
          element: <ProdectLayout />,
          children: [
            { index: true, element: <Prodectpage /> },
            { path: ":id", element: <ProdectDetail /> },
            { path: "create", element: <CreatePost />, loader: checkUserToken },
          ],
        },

        { path: "profile", element: <ProfilePage />, loader: checkUserToken },
        { path: "help", element: <HelpPage />, loader: checkUserToken },
      ],
    },

    { path: "/auth", element: <AuthPage /> },
  ]);
  return <RouterProvider router={route} />;
}

export default App;
