import axios from "axios";
import FormData from "form-data";
import Plate from "../models/Plate.model.js";

/* ======================================================
   PLATE RECOGNIZER – ANPR + DB SAVE
   ====================================================== */
export const scanPlateOCR = async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageBase64 or imageUrl is required",
      });
    }

    let payload;

    if (imageUrl) {
      payload = {
        url: imageUrl,          // ✅ MUST be `url`
        regions: ["in", "gb"],
      };
    } else {
      const imageData = imageBase64.startsWith("data:image")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      payload = {
        upload: imageData,
        regions: ["in", "gb"],
      };
    }

    const apiResponse = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      payload,
      {
        headers: {
          Authorization: `Token ${process.env.PLATE_RECOGNIZER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const result = apiResponse?.data?.results?.[0];

    if (!result) {
      return res.status(200).json({
        success: false,
        message: "No plate detected",
      });
    }

    const savedPlate = await Plate.create({
      plate: result.plate.toUpperCase()
    });

    return res.status(200).json({
      success: true,
      plate: savedPlate.plate,
      
    });
  } catch (error) {
    console.error(
      "Plate OCR Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Plate OCR failed",
      error: error.response?.data || error.message,
    });
  }
};

