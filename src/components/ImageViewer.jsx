import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://karnifasion-backend.onrender.com";

export default function ImageViewer({ onExit }) {

  const [mode, setMode] = useState("");          // Item | Series | Category
  const [options, setOptions] = useState([]);    // values for dropdown 2
  const [selected, setSelected] = useState("");  // selected option
  const [images, setImages] = useState([]);      // list of images

  // ------------------------------------------
  // LOAD DROPDOWN 2 OPTIONS BASED ON MODE
  // ------------------------------------------
  useEffect(() => {
    if (!mode) return;

    setSelected("");
    setImages([]);
    setOptions([]);

    if (mode === "Item") {
      axios.get(`${API}/products`)
        .then(res => {
          const list = res.data.map(x => x.Item);
          setOptions(list);
        });

    } else if (mode === "Series") {
      axios.get(`${API}/series/active-with-stock`)
        .then(res => {
          const list = res.data.map(x => x.SeriesName);
          setOptions(list);
        });

    } else if (mode === "Category") {
      axios.get(`${API}/categories/active-with-stock`)
        .then(res => {
          const list = res.data.map(x => x.CategoryName);
          setOptions(list);
        });
    }

  }, [mode]);


  // ------------------------------------------
  // LOAD IMAGES BASED ON SELECTION
  // ------------------------------------------
  useEffect(() => {
    if (!selected) return;

    // ITEM → single image
    if (mode === "Item") {
      axios.post(`${API}/stock`, { role: "Admin", customerType: 0 })
        .then(res => {
          const product = res.data.find(x => x.Item === selected);
          if (!product) return;
          axios.get(`${API}/image/${product.ProductID}`)
            .then(r => setImages(r.data.ImageURL ? [r.data.ImageURL] : []));
        });
    }

    // SERIES → list of images
    if (mode === "Series") {
      axios.get(`${API}/images/series/${selected}`)
        .then(res => {
          const list = res.data.map(x => x.ImageURL);
          setImages(list);
        });
    }

    // CATEGORY → list of images
    if (mode === "Category") {
      axios.get(`${API}/images/category/${selected}`)
        .then(res => {
          const list = res.data.map(x => x.ImageURL);
          setImages(list);
        });
    }

  }, [selected]);


  // ------------------------------------------
  // PDF DOWNLOAD (2 images per page)
  // ------------------------------------------
  const downloadPDF = () => {
    alert("PDF generation will be added next step.");
  };


  return (
    <div style={{ padding: 20 }}>

      <h2>Image Viewer</h2>

      {/* EXIT */}
      <button onClick={onExit} style={{ marginBottom: 15 }}>
        Exit
      </button>

      {/* DROPDOWN 1 */}
      <div>
        <label>Select Mode: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Item">Item</option>
          <option value="Series">Series</option>
          <option value="Category">Category</option>
        </select>
      </div>

      {/* DROPDOWN 2 */}
      {mode && (
        <div style={{ marginTop: 10 }}>
          <label>Select {mode}: </label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">-- Select --</option>
            {options.map((x, i) => (
              <option key={i} value={x}>{x}</option>
            ))}
          </select>
        </div>
      )}

      {/* PDF BUTTON */}
      {images.length > 0 && (
        <button
          onClick={downloadPDF}
          style={{ marginTop: 15 }}
        >
          Download PDF
        </button>
      )}

      {/* IMAGE VIEW AREA */}
      <div
        style={{
          marginTop: 20,
          maxHeight: "75vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {images.length === 0 && selected && (
          <div>No images found.</div>
        )}

        {/* ALWAYS 2 PER ROW */}
        {images.length > 0 &&
          images.reduce((rows, url, i) => {
            if (i % 2 === 0) rows.push([url]);
            else rows[rows.length - 1].push(url);
            return rows;
          }, []).map((pair, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-start"
              }}
            >
              {pair.map((url, j) => (
                <img
                  key={j}
                  src={url}
                  alt=""
                  style={{ width: "48%", objectFit: "contain" }}
                />
              ))}
            </div>
        ))}
      </div>

    </div>
  );
}
