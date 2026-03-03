import { LoaderProvider } from "./LoaderContext";
import { ViewerPage } from "./pages/ViewerPage";
import "./index.css";

export function App() {
  return (
    <LoaderProvider>
      <ViewerPage />
    </LoaderProvider>
  );
}

export default App;
