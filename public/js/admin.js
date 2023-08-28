const deleteProductHandler = async (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElement = btn.closest("article");

  const res = await fetch(`/admin/product/${prodId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  });
  console.log("🚀 ~ deleteProductHandler ~ res:", res);
  productElement.parentNode.removeChild(productElement);
};
