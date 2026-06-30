import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import React from "react";

const API = import.meta.env.VITE_API_URL;

const Chefmenu = () => {
  const ChefFoodMenu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [msg, setMsg] = useState({
      open: false,
      text: "",
      severity: "success",
    });

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/product/get-product-all`);

        setProducts(res.data.data || []);
      } catch (error) {
        console.log(error);

        setMsg({
          open: true,
          text: "Failed to fetch menu",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    const toggleStock = async (id, stock) => {
      const newStock = stock === "available" ? "unavailable" : "available";

      try {
        const res = await axios.put(
          `${API}/product/update-stock/${id}`,
          {
            stock: newStock,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (res.data.success) {
          setProducts((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, stock: newStock } : item,
            ),
          );

          setMsg({
            open: true,
            text: `Dish marked ${newStock}`,
            severity: "success",
          });
        }
      } catch (error) {
        console.log(error);

        setMsg({
          open: true,
          text: "Failed to update stock",
          severity: "error",
        });
      }
    };

    useEffect(() => {
      fetchProducts();
    }, []);

    if (loading)
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
          }}
        >
          <CircularProgress />
        </Box>
      );

    return (
      <>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Paper
                sx={{
                  bgcolor: "#111827",
                  borderRadius: 4,
                  overflow: "hidden",
                  color: "#fff",
                }}
              >
                <Box
                  component="img"
                  src={`${API}/uploads/${product.image}`}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                  }}
                />

                <Box p={2}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#facc15",
                      fontWeight: "bold",
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#cbd5e1",
                      fontSize: 13,
                      mb: 1,
                    }}
                  >
                    {product.description}
                  </Typography>

                  {/* <Typography
                    sx={{
                      color: "#4ade80",
                      fontWeight: "bold",
                      mb: 2,
                    }}
                  >
                    ₹{product.price}
                  </Typography> */}

                  <Chip
                    label={product.stock}
                    color={product.stock === "available" ? "success" : "error"}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    color={product.stock === "available" ? "error" : "success"}
                    onClick={() => toggleStock(product._id, product.stock)}
                  >
                    {product.stock === "available"
                      ? "Mark Unavailable"
                      : "Mark Available"}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Snackbar
          open={msg.open}
          autoHideDuration={3000}
          onClose={() =>
            setMsg((prev) => ({
              ...prev,
              open: false,
            }))
          }
        >
          <Alert severity={msg.severity}>{msg.text}</Alert>
        </Snackbar>
      </>
    );
  };
};

export default Chefmenu;
