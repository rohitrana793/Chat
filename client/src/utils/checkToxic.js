export const checkToxicMessage = async (text) => {
  const res = await fetch("http://localhost:5000/api/v1/mod/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  return await res.json();
};
