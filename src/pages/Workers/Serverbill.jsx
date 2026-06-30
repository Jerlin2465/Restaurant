// src/pages/Workers/Serverbill.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

const API = import.meta.env.VITE_API_URL;

const STATUS_COLOR = {
  open: { color: "#60a5fa", bg: "#1e3a5f", label: "Open" },
  pending_payment: {
    color: "#facc15",
    bg: "#451a03",
    label: "Pending Payment",
  },
  paid: { color: "#4ade80", bg: "#052e16", label: "Paid ✓" },
  cancelled: { color: "#f87171", bg: "#3b0a0a", label: "Cancelled" },
};

// ── Bill Card
const BillCard = ({ bill, onPay, onPendingPayment }) => {
  const cfg = STATUS_COLOR[bill.status] ?? STATUS_COLOR.open;
  const isPending = bill.status === "pending_payment";
  const isOpen = bill.status === "open";
  const isPaid = bill.status === "paid";
  return (
    <Paper
      elevation={isPending ? 6 : 2}
      sx={{
        bgcolor: "#111827",
        borderRadius: 3,
        overflow: "hidden",
        border: `1.5px solid ${isPending ? cfg.color : cfg.color + "44"}`,
        boxShadow: isPending ? `0 0 18px ${cfg.color}33` : "none",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: cfg.bg,
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TableRestaurantIcon sx={{ color: cfg.color, fontSize: 18 }} />
          <Typography sx={{ color: cfg.color, fontWeight: 700, fontSize: 15 }}>
            Table #{bill.tableNumber}
          </Typography>
        </Box>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: `${cfg.color}22`,
            color: cfg.color,
            fontWeight: 700,
            fontSize: 11,
            border: `1px solid ${cfg.color}44`,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#1f2937" }} />

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        {/* Shop Name */}
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <StorefrontIcon sx={{ color: "#facc15", fontSize: 16 }} />
          <Typography sx={{ color: "#facc15", fontWeight: 700, fontSize: 14 }}>
            {bill.shopName || "Jerry Restaurant"}
          </Typography>
        </Box>

        {/* ── Customer Name (from booking when server took table) ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#1f2937",
            borderRadius: 2,
            px: 1.5,
            py: 1,
            mb: 1,
          }}
        >
          <PersonIcon sx={{ color: "#60a5fa", fontSize: 18 }} />
          <Box>
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              CUSTOMER
            </Typography>
            <Typography
              sx={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}
            >
              {bill.customerName || "—"}
            </Typography>
          </Box>
        </Box>

        {/* ── Server Name (logged-in server who took table) ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#1f2937",
            borderRadius: 2,
            px: 1.5,
            py: 1,
            mb: 1.5,
          }}
        >
          <BadgeIcon sx={{ color: "#a78bfa", fontSize: 18 }} />
          <Box>
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              SERVER
            </Typography>
            <Typography
              sx={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}
            >
              {bill.serverName || "—"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#1f2937", mb: 1.5 }} />

        {/* ── Food Ordered section ── */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <RestaurantMenuIcon sx={{ color: "#4ade80", fontSize: 15 }} />
          <Typography
            sx={{
              color: "#9ca3af",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            FOOD ORDERS
          </Typography>
        </Box>

        {bill.items.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#0f172a",
              borderRadius: 2,
              py: 2.5,
              textAlign: "center",
              border: "1px dashed #1f2937",
            }}
          >
            <Typography sx={{ color: "#4b5563", fontSize: 13 }}>
              No items yet
            </Typography>
            <Typography sx={{ color: "#374151", fontSize: 11, mt: 0.5 }}>
              Food appears here when chef marks orders as Served
            </Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: "#0f172a", borderRadius: 2, overflow: "hidden" }}>
            {/* Column headers */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 44px 72px",
                px: 1.5,
                py: 0.75,
                bgcolor: "#1e293b",
              }}
            >
              <Typography
                sx={{ color: "#6b7280", fontSize: 11, fontWeight: 700 }}
              >
                ITEM
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                QTY
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                PRICE
              </Typography>
            </Box>

            {/* Food rows — name, quantity, price */}
            {bill.items.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 44px 72px",
                  px: 1.5,
                  py: 0.85,
                  borderTop: "1px solid #1f2937",
                  "&:hover": { bgcolor: "#1f293755" },
                }}
              >
                <Typography sx={{ color: "#d1d5db", fontSize: 13 }}>
                  {item.name}
                </Typography>
                <Typography
                  sx={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}
                >
                  ×{item.quantity}
                </Typography>
                <Typography
                  sx={{ color: "#d1d5db", fontSize: 13, textAlign: "right" }}
                >
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: "#1f2937", mt: 1.5, mb: 1 }} />

        {/* ── Totals ── */}
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
            Subtotal
          </Typography>
          <Typography sx={{ color: "#d1d5db", fontSize: 13 }}>
            ₹{bill.totalAmount?.toFixed(0)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={0.25}>
          <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
            Tax ({bill.taxRate || 5}%)
          </Typography>
          <Typography sx={{ color: "#d1d5db", fontSize: 13 }}>
            ₹{bill.taxAmount?.toFixed(0)}
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          mt={1}
          sx={{ bgcolor: "#1f2937", borderRadius: 2, px: 1.5, py: 0.75 }}
        >
          <Typography sx={{ color: "#facc15", fontWeight: 700, fontSize: 15 }}>
            Grand Total
          </Typography>
          <Typography sx={{ color: "#facc15", fontWeight: 700, fontSize: 15 }}>
            ₹{bill.grandTotal?.toFixed(0)}
          </Typography>
        </Box>
      </Box>

      {/*  Actions  */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          pt: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {isOpen && bill.items.length > 0 && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={() => onPendingPayment(bill)}
            sx={{
              color: "#facc15",
              borderColor: "#facc1544",
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { borderColor: "#facc15", bgcolor: "#facc1511" },
            }}
          >
            Request Payment
          </Button>
        )}

        {isPending && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => onPay(bill)}
            sx={{
              bgcolor: "#4ade80",
              color: "#000",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 2,
              "&:hover": { bgcolor: "#22c55e" },
            }}
          >
            Collect Payment
          </Button>
        )}

        {isPaid && (
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#4ade80 !important" }} />}
            label={`Paid via ${bill.paymentMethod?.toUpperCase() || "CASH"} • ${new Date(bill.paidAt).toLocaleTimeString()}`}
            sx={{
              width: "100%",
              bgcolor: "#052e1688",
              color: "#4ade80",
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 2,
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

//  Payment Dialog
const PaymentDialog = ({ bill, open, onClose, onConfirm }) => {
  const [method, setMethod] = useState("cash");
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm(bill, method);
    setBusy(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "#111827",
          color: "#fff",
          borderRadius: 3,
          minWidth: 360,
        },
      }}
    >
      <DialogTitle sx={{ color: "#facc15", fontWeight: 700 }}>
        💳 Collect Payment
      </DialogTitle>

      <DialogContent>
        {/* Customer / Server / Table summary */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 80px",
            gap: 1,
            bgcolor: "#1f2937",
            borderRadius: 2,
            p: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ color: "#6b7280", fontSize: 10, fontWeight: 700 }}
            >
              CUSTOMER
            </Typography>
            <Typography
              sx={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600 }}
            >
              {bill?.customerName || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ color: "#6b7280", fontSize: 10, fontWeight: 700 }}
            >
              SERVER
            </Typography>
            <Typography
              sx={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600 }}
            >
              {bill?.serverName || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ color: "#6b7280", fontSize: 10, fontWeight: 700 }}
            >
              TABLE
            </Typography>
            <Typography
              sx={{ color: "#60a5fa", fontSize: 13, fontWeight: 700 }}
            >
              #{bill?.tableNumber}
            </Typography>
          </Box>
        </Box>

        {/* Food items in dialog */}
        {bill?.items?.length > 0 && (
          <Box
            sx={{
              bgcolor: "#0f172a",
              borderRadius: 2,
              mb: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 44px 72px",
                px: 1.5,
                py: 0.75,
                bgcolor: "#1e293b",
              }}
            >
              <Typography
                sx={{ color: "#6b7280", fontSize: 11, fontWeight: 700 }}
              >
                ITEM
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                QTY
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                PRICE
              </Typography>
            </Box>
            {bill.items.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 44px 72px",
                  px: 1.5,
                  py: 0.7,
                  borderTop: "1px solid #1f2937",
                }}
              >
                <Typography sx={{ color: "#d1d5db", fontSize: 13 }}>
                  {item.name}
                </Typography>
                <Typography
                  sx={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}
                >
                  ×{item.quantity}
                </Typography>
                <Typography
                  sx={{ color: "#d1d5db", fontSize: 13, textAlign: "right" }}
                >
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Grand total */}
        <Box
          sx={{
            bgcolor: "#1f2937",
            borderRadius: 2,
            p: 2,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
            Amount to Collect
          </Typography>
          <Typography sx={{ color: "#4ade80", fontWeight: 800, fontSize: 28 }}>
            ₹{bill?.grandTotal?.toFixed(0)}
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 11 }}>
            incl. {bill?.taxRate}% tax (₹{bill?.taxAmount?.toFixed(0)})
          </Typography>
        </Box>

        <Typography sx={{ color: "#9ca3af", fontSize: 13, mb: 1 }}>
          Payment Method
        </Typography>
        <ToggleButtonGroup
          value={method}
          exclusive
          onChange={(_, v) => v && setMethod(v)}
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              color: "#6b7280",
              borderColor: "#374151",
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#facc15",
                bgcolor: "#facc1522",
                borderColor: "#facc15",
              },
            },
          }}
        >
          <ToggleButton value="cash">
            <CurrencyRupeeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Cash
          </ToggleButton>
          <ToggleButton value="card">
            <CreditCardIcon sx={{ mr: 0.5, fontSize: 18 }} /> Card
          </ToggleButton>
          <ToggleButton value="upi">
            <QrCode2Icon sx={{ mr: 0.5, fontSize: 18 }} /> UPI
          </ToggleButton>
        </ToggleButtonGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: "#6b7280", fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={busy}
          onClick={handleConfirm}
          sx={{
            bgcolor: "#4ade80",
            color: "#000",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: "#22c55e" },
          }}
        >
          {busy ? "Processing…" : "Confirm Payment ✓"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

//  Main Serverbill
const Serverbill = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [payDialog, setPayDialog] = useState({ open: false, bill: null });
  const [snack, setSnack] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  const fetchBills = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/bill/my-bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setBills(res.data.bills);
      }
    } catch {
      setSnack({ open: true, text: "Failed to load bills", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
    // Poll every 15 seconds so food items appear as soon as chef serves them
    const timer = setInterval(fetchBills, 15000);
    return () => clearInterval(timer);
  }, [fetchBills]);

  const handlePendingPayment = async (bill) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/bill/pending-payment/${bill._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnack({ open: true, text: "Bill sent for payment", severity: "info" });
      fetchBills();
    } catch (err) {
      setSnack({
        open: true,
        text: err?.response?.data?.message || "Failed",
        severity: "error",
      });
    }
  };

  const handlePayConfirm = async (bill, paymentMethod) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/bill/pay/${bill._id}`,
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // FIX: removed localStorage.removeItem("tableNumber") — a server may
      // serve multiple tables simultaneously; clearing it here would break other active tables.
      setSnack({
        open: true,
        text: `Payment collected! Table #${bill.tableNumber} cleared for next customer.`,
        severity: "success",
      });
      fetchBills();
    } catch (err) {
      setSnack({
        open: true,
        text: err?.response?.data?.message || "Payment failed",
        severity: "error",
      });
    }
  };

  if (loading)
    return (
      <Box textAlign="center" py={8}>
        <CircularProgress sx={{ color: "#facc15" }} />
        <Typography sx={{ color: "#9ca3af", mt: 2 }}>Loading bills…</Typography>
      </Box>
    );

  const openBills = bills.filter((b) => b.status === "open");
  const pendingBills = bills.filter((b) => b.status === "pending_payment");
  const paidBills = bills.filter((b) => b.status === "paid");

  const tabs = [
    {
      label: "Open",
      bills: openBills,
      count: openBills.length,
      color: "#60a5fa",
      empty: "No open bills",
    },
    {
      label: "Awaiting Payment",
      bills: pendingBills,
      count: pendingBills.length,
      color: "#facc15",
      empty: "No pending payments",
    },
    {
      label: "Paid",
      bills: paidBills,
      count: paidBills.length,
      color: "#4ade80",
      empty: "No paid bills yet",
    },
  ];

  return (
    <Box>
      {/* Summary chips */}
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={3}>
        {tabs.map((t) => (
          <Chip
            key={t.label}
            label={`${t.count} ${t.label}`}
            sx={{
              bgcolor: `${t.color}22`,
              color: t.color,
              fontWeight: 700,
              border: `1px solid ${t.color}44`,
            }}
          />
        ))}
      </Box>

      {/* Tab bar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 3,
          borderBottom: "1px solid #1f2937",
          pb: 1,
        }}
      >
        {tabs.map((t, i) => (
          <Button
            key={i}
            onClick={() => setTab(i)}
            sx={{
              color: tab === i ? "#facc15" : "#6b7280",
              fontWeight: 700,
              fontSize: 13,
              borderBottom:
                tab === i ? "2px solid #facc15" : "2px solid transparent",
              borderRadius: 0,
              pb: 0.5,
              textTransform: "none",
            }}
          >
            <Badge
              badgeContent={t.count}
              color={i === 1 ? "warning" : i === 2 ? "success" : "primary"}
              sx={{ "& .MuiBadge-badge": { right: -8, top: 2 } }}
            >
              <Box component="span" pr={t.count > 0 ? 2 : 0}>
                {t.label}
              </Box>
            </Badge>
          </Button>
        ))}
      </Box>

      {/* Bill cards */}
      {tabs[tab].bills.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography sx={{ color: "#4b5563", fontSize: 15 }}>
            {tabs[tab].empty}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {tabs[tab].bills.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill._id}>
              <BillCard
                bill={bill}
                onPay={(b) => setPayDialog({ open: true, bill: b })}
                onPendingPayment={handlePendingPayment}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <PaymentDialog
        open={payDialog.open}
        bill={payDialog.bill}
        onClose={() => setPayDialog({ open: false, bill: null })}
        onConfirm={handlePayConfirm}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Serverbill;
