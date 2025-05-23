const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, "public")));

// نقطة API لفحص بيانات ICCID - سيرفر وسيط لإخفاء API Key
app.get("/api/check", async (req, res) => {
  const { iccid } = req.query;

  if (!iccid) {
    return res.status(400).json({ error: "Missing 'iccid' query parameter" });
  }

  try {
    const apiRes = await fetch(`https://api.esim-go.com/v2.4/esims/${iccid}/bundles`, {
      headers: {
        "X-API-Key": "WASne7TcbZ9qtrjhfxEe2VEDwlhbsGgBFSDJkmul" // مفتاح API سري هنا
      }
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: `API responded with status ${apiRes.status}` });
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching from esim-go API:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
