import React, { createContext, useContext, useMemo } from "react";
import { OCCTLoader } from "./utils/OCCTLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  // We instantiate the loaders once and share them across the entire session
  const loaders = useMemo(
    () => ({
      occtLoader: new OCCTLoader(),
      stlLoader: new STLLoader(),
      objLoader: new OBJLoader(),
    }),
    [],
  );

  return (
    <LoaderContext.Provider value={loaders}>{children}</LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
