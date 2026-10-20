'use client';
import { createContext, useContext } from 'react';
const CategoriesContext = createContext([]);
export function CategoriesProvider({ categories, children }) {
  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}
export const useCategories = () => useContext(CategoriesContext);
