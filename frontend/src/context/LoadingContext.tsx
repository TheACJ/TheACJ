// LoadingContext.tsx
import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext<{
  setChildLoading: (isLoading: boolean) => void;
}>({ setChildLoading: () => {} });

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [childLoading, setChildLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setChildLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);