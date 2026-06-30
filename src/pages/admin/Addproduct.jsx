import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import img from "../../assets/download-img.png";
import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Addproduct = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "available",
  });

  const [image, setImage] = useState(null);

  // ================= SNACKBAR =================
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const showSnackbar = (msg, severity = "success") => {
    setMessage(msg);
    setType(severity);
    setOpen(true);
  };

  const handleImageClick = () => {
    fileRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
  };

  const handleChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      showSnackbar("Please upload image", "warning");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("image", image);
      formData.append("stock", product.stock);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/product/create-product`,
        formData,
        {
          withCredentials: true,
        },
      );

      console.log(res.data);

      showSnackbar("Product Added Successfully", "success");

      setProduct({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
      });

      setImage(null);
    } catch (error) {
      console.log(error);
      showSnackbar("Upload Failed", "error");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0f172a",
            px: 2,
            ml:28,
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: 420 },
              p: 3,
              mt: 5,
              borderRadius: 3,
              backgroundColor: "#aaa",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ textAlign: "center" }}
            >
              Add Product
            </Typography>
            {/* IMAGE PREVIEW */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                src={image ? URL.createObjectURL(image) : img}
                onClick={handleImageClick}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  cursor: "pointer",
                  border: "1px solid #555",
                  borderRadius: 2,
                }}
              />
            </Box>
            <TextField
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Product Price"
              name="price"
              value={product.price}
              type="number"
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              fullWidth
              multiline
              sx={{
                "& .MuiInputBase-inputMultiline": { color: "#fff" },
              }}
            />
            <TextField
              label="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              fullWidth
              multiline
              sx={{
                "& .MuiInputBase-inputMultiline": { color: "#fff" },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                name="stock"
                value={product.stock}
                label="Stock Status"
                onChange={handleChange}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#000",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#111" },
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={type} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Addproduct;
