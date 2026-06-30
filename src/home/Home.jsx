import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";
import banner1 from "../assets/banner1.jpg";
import img from "../assets/img.jpg";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";
import img6 from "../assets/img6.jpg";
import img7 from "../assets/img7.jpg";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tablebooking from "../pages/Tablebooking";
import { useNavigate } from "react-router-dom";
import Homeproduct from "./Homeproduct";

const images = [img, img1, img2, img3, img4, img5, img7];

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <>
      <Box>
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            backgroundImage: `url(${banner1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",

            px: { xs: 3, md: 8 },
          }}
        >
          {/* Text Content */}
          <Box
            sx={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                color: "#ffffffbc",
                backgroundColor: "rgba(0,0,0,0.6)",
                p: { xs: 3, md: 5 },
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  fontSize: { xs: "40px", md: "70px" },
                }}
              >
                Delicious Food
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  lineHeight: 1.8,
                  fontSize: { xs: "16px", md: "22px" },
                }}
              >
                Fresh flavors, unforgettable moments.
                <br />
                Experience delicious food made with love every day.
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* img scrolling */}
        <Box
          sx={{
            width: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "max-content",
              animation: "scroll 20s linear infinite",
              "@keyframes scroll": {
                from: {
                  transform: "translateX(0)",
                },
                to: {
                  transform: "translateX(-50%)",
                },
              },
            }}
          >
      
            {[...images, ...images].map((img, index) => (
              <Box
                component="img"
                key={index}
                src={img}
                alt=""
                sx={{
                  width: { xs: 200, md: 300 },
                  height: { xs: 200, md: 320 },
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        </Box>
        {/* product page */}
        <Box>
          <Homeproduct />
        </Box>
        {/* about page */}
        <Box
          sx={{
            py: 4,
            backgroundColor: "#0c0d1b",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Container>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 6,
                color: "#ffffffac",
                textAlign: "center",
              }}
            >
              About Our Restaurant
            </Typography>

            <Grid
              container
              spacing={5}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={img6}
                alt="Restaurant"
                sx={{
                  width: { xs: "280px", md: "400px" },
                  height: { xs: "280px", md: "450px" },
                  borderRadius: "16px",
                  boxShadow: 3,
                  objectFit: "cover",
                }}
              />

              {/* Text */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 2,
                    mb: 3,
                    fontSize: "18px",
                    color: "#ffffffac",
                  }}
                >
                  Welcome to our restaurant, where passion meets flavor. We
                  serve delicious meals prepared with fresh ingredients and
                  authentic recipes. Our mission is to create memorable dining
                  experiences for every customer.
                  <br /> From traditional dishes to modern favorites, every
                  plate is crafted with care and love. Enjoy a warm atmosphere,
                  friendly service, and unforgettable taste with us.
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#000",
                    px: 4,
                    py: 1.5,
                    borderRadius: "30px",
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                  }}
                  onClick={() => navigate("/menu")}
                >
                  Explore Menu
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
        {/* table */}
        {user?.role !== "worker" && <Tablebooking />} {/* footer */}
        <Box
          sx={{
            backgroundColor: "#000",
            color: "#fff",
            py: 5,
            px: 3,
          }}
        >
          <Container>
            <Grid container spacing={4}>
              {/* Restaurant Info */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  Foodie Restaurant
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 2,
                    color: "#cccccc",
                  }}
                >
                  Enjoy delicious food, fresh ingredients, and unforgettable
                  dining experiences with us.
                </Typography>
              </Grid>

              {/* Quick Links */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  Quick Links
                </Typography>

                <Typography sx={{ mb: 1, color: "#cccccc" }}>Home</Typography>

                <Typography sx={{ mb: 1, color: "#cccccc" }}>About</Typography>

                <Typography sx={{ mb: 1, color: "#cccccc" }}>Menu</Typography>

                <Typography sx={{ color: "#cccccc" }}>Contact</Typography>
              </Grid>

              {/* Contact */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  Contact Us
                </Typography>

                <Typography sx={{ mb: 1, color: "#cccccc" }}>
                  Tamil Nadu, India
                </Typography>

                <Typography sx={{ mb: 1, color: "#cccccc" }}>
                  +91 9876543210
                </Typography>

                <Typography sx={{ color: "#cccccc" }}>
                  foodie@gmail.com
                </Typography>
              </Grid>
            </Grid>

            {/* Bottom Footer */}
            <Box
              sx={{
                borderTop: "1px solid #333",
                mt: 4,
                pt: 3,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#999" }}>
                © 2026 Foodie Restaurant. All Rights Reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Home;
