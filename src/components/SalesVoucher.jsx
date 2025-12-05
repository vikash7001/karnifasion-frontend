// SalesVoucher.jsx
import React, { useEffect, useState, useRef } from "react";
import { api, postSales } from "../services/api";

const LOCATIONS = ["Jaipur", "Kolkata"];

export default function SalesVoucher() {
  const user = JSON.parse(localStorage.getItem("kf_user"));

  // lookups
  const [products, setProducts] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);

  // header inputs
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [customer, setCustomer] = useState("");
  const [voucherNo, setVoucherNo] = useState("");

  // row inputs
  const [item, setItem] = useState("");
  const [series, setSeries] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");

  // suggestions UI
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [seriesSuggestions, setSeriesSuggestions] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showItemSug, setShowItemSug] = useState(false);
  const [showSeriesSug, setShowSeriesSug] = useState(false);
  const [showCustSug, setShowCustSug] = useState(false);

  // added rows
  const [rows, setRows] = useState([]);

  // refs for click-outside
  const itemRef = useRef();
  const seriesRef = useRef();
  const custRef = useRef();

  // -------------------------------
  // Load lookups
  // -------------------------------
  useEffect(() => {
    (async () => {
      try {
        const p = await api.get("/products");
        setProducts(p.data || p);

        const s = await api.get("/series");
        setSeriesList((s.data || s).map(r => r.SeriesName ?? r));

        const c = await api.get("/categories");
        setCategories((c.data || c).map(r => r.CategoryName ?? r));

        const cu = await api.get("/customers");
        setCustomers((cu.data || cu).map(r => r.CustomerName ?? r));
      } catch (err) {
        console.error("Lookup fetch error", err);
        alert("Failed to load lookups. Check console.");
      }
    })();
  }, []);

  // ---------------------------------------------------------
  // Click outside suggestions
  // ---------------------------------------------------------
  useEffect(() => {
    function onClick(e) {
      if (itemRef.current && !itemRef.current.contains(e.target)) setShowItemSug(false);
      if (seriesRef.current && !seriesRef.current.contains(e.target)) setShowSeriesSug(false);
      if (custRef.current && !custRef.current.contains(e.target)) setShowCustSug(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ---------------------------------------------------------
  // ITEM
  // ---------------------------------------------------------
  const onItemChange = (val) => {
    setItem(val);
    setSeries("");
    setCategory("");

    if (!val.trim()) {
      setItemSuggestions([]);
      setShowItemSug(false);
      return;
    }

    const q = val.toLowerCase();
    const matches = products
      .filter(p =>
        (p.Item && p.Item.toLowerCase().includes(q)) ||
        (p.ProductID && p.ProductID.toString().includes(q))
      )
      .slice(0, 12);

    setItemSuggestions(matches);
    setShowItemSug(matches.length > 0);
  };

  const selectProduct = (p) => {
    setItem(p.Item);
    setSeries(p.SeriesName || "");
    setCategory(p.CategoryName || "");
    setShowItemSug(false);
  };

  // ---------------------------------------------------------
  // SERIES
  // ---------------------------------------------------------
  const onSeriesChange = (val) => {
    setSeries(val);
    setCategory("");

    if (!val.trim()) {
      setSeriesSuggestions([]);
      setShowSeriesSug(false);
      return;
    }

    const q = val.toLowerCase();
    const matches = seriesList.filter(s => s.toLowerCase().startsWith(q)).slice(0, 12);

    setSeriesSuggestions(matches);
    setShowSeriesSug(matches.length > 0);

    const exact = seriesList.find(s => s.toLowerCase() === q);
    if (exact) {
      const match = products.find(p => p.SeriesName?.toLowerCase() === exact.toLowerCase());
      if (match?.CategoryName) setCategory(match.CategoryName);
    }
  };

  const selectSeries = (s) => {
    setSeries(s);
    setShowSeriesSug(false);

    const match = products.find(p => p.SeriesName?.toLowerCase() === s.toLowerCase());
    if (match?.CategoryName) setCategory(match.CategoryName);
  };

  // ---------------------------------------------------------
  // CUSTOMER
  // ---------------------------------------------------------
  const onCustomerChange = (val) => {
    setCustomer(val);

    if (!val.trim()) {
      setCustomerSuggestions([]);
      setShowCustSug(false);
      return;
    }

    const q = val.toLowerCase();
    const matches = customers.filter(c => (c && c.toLowerCase().includes(q))).slice(0, 12);
    setCustomerSuggestions(matches);
    setShowCustSug(matches.length > 0);
  };

  const selectCustomer = (c) => {
    setCustomer(c);
    setShowCustSug(false);
  };

  // ---------------------------------------------------------
  // ADD ROW
  // ---------------------------------------------------------
  const onAddRow = () => {
    if (!item || !qty) {
      alert("Enter Item and Quantity");
      return;
    }

    const existing = products.find(p => p.Item === item && p.SeriesName === series);

    if (!existing && !series.trim()) {
      alert("New item detected — please enter Series");
      return;
    }

    const seriesExists = seriesList.includes(series);
    if (!seriesExists && !category.trim()) {
      alert("New series detected — select category");
      return;
    }

    const newRow = {
      Item: item,
      SeriesName: series,
      CategoryName: category,
      Quantity: Number(qty)
    };

    setRows(prev => [...prev, newRow]);

    // clear row inputs
    setItem("");
    setSeries("");
    setCategory("");
    setQty("");
  };

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------
  const onSubmit = async () => {
    if (rows.length === 0) {
      alert("No rows to post");
      return;
    }

    const payload = {
      UserName: user?.Username || "vikash",
      Location: location,
      Customer: customer || null,
      VoucherNo: voucherNo || null,
      Rows: rows.map(r => ({
        Item: r.Item,
        SeriesName: r.SeriesName,
        CategoryName: r.CategoryName,
        Quantity: Number(r.Quantity)
      }))
    };

    console.log("SALES PAYLOAD SENDING:", payload);

    try {
      const resp = await postSales(payload);
      const data = resp.data ?? resp;

      if (data.success) {
        alert("Sales posted successfully");

        setRows([]);
        setCustomer("");
        setVoucherNo("");
        setLocation(LOCATIONS[0]);
        setItem("");
        setSeries("");
        setCategory("");
        setQty("");
      } else {
        alert("Post failed: " + JSON.stringify(data));
      }

    } catch (err) {
      console.error("SUBMIT ERROR:", err.response?.data || err);
      alert("Submit failed — check console.");
    }
  };

  const small = { padding: "6px 8px", marginRight: 8 };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div style={{ padding: 18 }}>
      <h2>Sales Voucher</h2>

      {/* HEADER */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Location:</label>
        <select value={location} onChange={e => setLocation(e.target.value)} style={{ marginRight: 16 }}>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>

        <span style={{ marginRight: 8 }}>
          <label style={{ marginRight: 6 }}>Customer:</label>
          <span ref={custRef} style={{ position: "relative" }}>
            <input
              style={{ ...small, width: 220 }}
              placeholder="Customer"
              value={customer}
              onChange={e => onCustomerChange(e.target.value)}
            />
            {showCustSug && (
              <div style={{
                position: "absolute", top: 36, left: 0, width: 300,
                border: "1px solid #ccc", background: "#fff", zIndex: 10
              }}>
                {customerSuggestions.map((c, i) => (
                  <div key={i} style={{ padding: 8, cursor: "pointer" }} onClick={() => selectCustomer(c)}>
                    {c}
                  </div>
                ))}
              </div>
            )}
          </span>
        </span>

        <span style={{ marginLeft: 16 }}>
          <label style={{ marginRight: 6 }}>Voucher No:</label>
          <input value={voucherNo} onChange={e => setVoucherNo(e.target.value)}
            style={{ ...small, width: 160 }} placeholder="Optional" />
        </span>
      </div>

      {/* INPUT ROW */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>

        {/* ITEM */}
        <div style={{ position: "relative" }} ref={itemRef}>
          <input
            style={{ ...small, width: 220 }}
            placeholder="Item"
            value={item}
            onChange={e => onItemChange(e.target.value)}
          />
          {showItemSug && (
            <div style={{
              position: "absolute", top: 36, left: 0, width: 300,
              border: "1px solid #ccc", background: "#fff", zIndex: 10
            }}>
              {itemSuggestions.map((p, i) => (
                <div key={i} style={{ padding: 8, cursor: "pointer" }}
                  onClick={() => selectProduct(p)}>
                  <b>{p.Item}</b> — {p.SeriesName} ({p.CategoryName})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SERIES */}
        <div style={{ position: "relative" }} ref={seriesRef}>
          <input
            style={{ ...small, width: 180 }}
            placeholder="Series"
            value={series}
            onChange={e => onSeriesChange(e.target.value)}
          />
          {showSeriesSug && (
            <div style={{
              position: "absolute", top: 36, left: 0, width: 200,
              border: "1px solid #ccc", background: "#fff", zIndex: 10
            }}>
              {seriesSuggestions.map((s, i) => (
                <div key={i} style={{ padding: 8, cursor: "pointer" }}
                  onClick={() => selectSeries(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY */}
        <input
          list="catList"
          style={{ ...small, width: 180 }}
          placeholder="Category (if new)"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <datalist id="catList">
          {categories.map((c, i) => <option key={i} value={c} />)}
        </datalist>

        {/* QTY */}
        <input
          style={{ ...small, width: 80 }}
          type="number"
          placeholder="Qty"
          value={qty}
          onChange={e => setQty(e.target.value)}
        />

        <button onClick={onAddRow}>Add</button>
      </div>

      {/* GRID */}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Series</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: "center", padding: 12 }}>No rows added</td></tr>
          )}

          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: 6 }}>{r.Item}</td>
              <td style={{ padding: 6 }}>{r.SeriesName}</td>
              <td style={{ padding: 6 }}>{r.CategoryName}</td>
              <td style={{ padding: 6, textAlign: "right" }}>{r.Quantity}</td>
              <td style={{ padding: 6 }}>
                <button onClick={() => removeRow(i)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button onClick={onSubmit} style={{ padding: "8px 16px" }}>
          Submit Sales
        </button>
      </div>
    </div>
  );
}
