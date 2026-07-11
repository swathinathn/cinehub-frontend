export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
